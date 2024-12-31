//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../_shared/instances/prismaClient.js";

import { Library } from "../components/Library.js";

import { ServerFritterContext } from "../instances/server.js";

import * as LibraryLib from "../../_shared/libs/Library.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/",
	handler: async (context) =>
	{
		//
		// Get Parameters
		//

		const searchParameters = context.fritterRequest.getSearchParams();

		const filterOptions = LibraryLib.parseFilterOptions(context.fritterRequest.getSearchParams());
		
		let selectedGameId: number | null = parseInt(searchParameters.get("selectedGameId") ?? "");

		if (selectedGameId != null && isNaN(selectedGameId))
		{
			selectedGameId = null;
		}

		//
		// Find Games
		//

		let games = await prismaClient.game.findMany(
			{
				where:
				{
					isHidden: false,
					isNsfw: false,
				},
				orderBy:
				[
					{
						isFavorite: "desc",
					},
					{
						lastPlayedDate:
						{
							sort: "desc",
							nulls: "last",
						},
					},
					{
						name: "asc",
					},
				],
			});

		//
		// Sort Games
		//

		switch (filterOptions.sortMode)
		{
			case "lastPlayed":
				games = games.sort(
					(a, b) =>
					{
						if (a.lastPlayedDate != null && b.lastPlayedDate != null)
						{
							if (a.lastPlayedDate > b.lastPlayedDate)
							{
								return -1;
							}
							else
							{
								return 1;
							}
						}
						else if (a.lastPlayedDate != null)
						{
							return -1;
						}
						else if (b.lastPlayedDate != null)
						{
							return 1;
						}

						return a.sortName.localeCompare(b.sortName);
					});

				break;
		}

		//
		// Group Games
		//

		const gameGroups = new Map<string, typeof games>();

		if (filterOptions.groupFavoritesSeparately)
		{
			const favoriteGames = games.filter((game) => game.isFavorite);

			if (favoriteGames.length > 0)
			{
				gameGroups.set("Favorites", favoriteGames);
			}

			games = games.filter((game) => !game.isFavorite);
		}

		switch (filterOptions.groupMode)
		{
			case "lastPlayed":
			default:
				const playedGames = games.filter((game) => game.playTimeTotalSeconds > 0);

				if (playedGames.length > 0)
				{
					for (const playedGame of playedGames)
					{
						const year = playedGame.lastPlayedDate?.getFullYear() ?? 0;

						const yearGroup = gameGroups.get(year.toString()) ?? [];

						yearGroup.push(playedGame);

						gameGroups.set(year.toString(), yearGroup);
					}
				}

				const unplayedGames = games.filter((game) => game.playTimeTotalSeconds == 0);

				if (unplayedGames.length > 0)
				{
					gameGroups.set("Unplayed Games", unplayedGames);
				}

				break;
		}

		//
		// Find Selected Game
		//

		const selectedGame = selectedGameId != null
			? await prismaClient.game.findFirst(
				{
					where:
					{
						id: selectedGameId,
					},
					include:
					{
						gamePlayActions: true,
					},
				})
			: null;

		const recentGamePlayActionSessions = selectedGame != null
			? await prismaClient.gamePlayActionSession.findMany(
				{
					where:
					{
						gamePlayAction:
						{
							game_id: selectedGame.id,
						},
					},
					include:
					{
						platform: true,
					},
					orderBy:
					[
						{
							startDate: "desc",
						},
						{
							createdDate: "desc",
						},
					],
				})
			: [];

		//
		// Render Library
		//

		context.fritterResponse.setContentType("text/html");
		context.fritterResponse.setBody(Library(gameGroups, selectedGame, recentGamePlayActionSessions, searchParameters).renderToString());
	},
};