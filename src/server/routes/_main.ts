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
		// Get Search Parameters
		//

		const searchParameters = context.fritterRequest.getSearchParams();

		//
		// Get Filter Options
		//

		const filterOptionsParseResult = LibraryLib.FilterOptionsSchema.safeParse(JSON.parse(searchParameters.get("filterOptions") ?? "{}"));

		if (!filterOptionsParseResult.success)
		{
			const defaultFilterOptions: LibraryLib.FilterOptions =
			{
				groupMode: "lastPlayed",
				sortMode: "lastPlayed",

				showFavoritesGroup: true,

				showVisibleGames: true,
				showHiddenGames: false,
				showNsfwGames: false,
			};

			const newSearchParameters = new URLSearchParams(searchParameters);

			newSearchParameters.set("filterOptions", JSON.stringify(defaultFilterOptions));

			return context.fritterResponse.setRedirect("/?" + newSearchParameters.toString());
		}

		const filterOptions = filterOptionsParseResult.data;

		//
		// Get Selected Game ID
		//
		
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
		// Filter Out Games
		//

		if (!filterOptions.showVisibleGames)
		{
			games = games.filter((game) => game.isHidden || game.isNsfw);
		}

		if (!filterOptions.showHiddenGames)
		{
			games = games.filter((game) => !game.isHidden);
		}

		if (!filterOptions.showNsfwGames)
		{
			games = games.filter((game) => !game.isNsfw);
		}

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

		if (filterOptions.showFavoritesGroup)
		{
			const favoriteGames = games.filter((game) => game.isFavorite);

			if (favoriteGames.length > 0)
			{
				gameGroups.set("Favorites", favoriteGames);
			}
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
		context.fritterResponse.setBody(Library(
			{
				searchParameters,
				filterOptions,
				gameGroups, 
				selectedGame, 
				recentGamePlayActionSessions,
			}).renderToString());
	},
};