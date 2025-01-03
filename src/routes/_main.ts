//
// Imports
//

import * as Fritter from "@donutteam/fritter";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { Library, LibraryOptions } from "../components/Library.js";

import { LGGL_GAME_PLAY_ACTION_SESSION_HISTORY_DAYS } from "../env/LGGL_GAME_PLAY_ACTION_SESSION_HISTORY_DAYS.js";

import { prismaClient } from "../instances/prismaClient.js";
import { ServerFritterContext } from "../instances/server.js";

import * as LibrarySchemaLib from "../libs/schemas/Library.js";

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

		const filterOptionsParseResult = LibrarySchemaLib.FilterOptionsSchema.safeParse(JSON.parse(searchParameters.get("filterOptions") ?? "{}"));

		if (!filterOptionsParseResult.success)
		{
			const defaultFilterOptions: LibrarySchemaLib.FilterOptions =
			{
				groupMode: "lastPlayed",

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
		// Initialise Game Groups Map
		//

		const gameGroups: LibraryOptions["gameGroups"] = new Map();

		//
		// Get All Games
		//

		let games = await prismaClient.game.findMany(
			{
				include:
				{
					seriesGames:
					{
						include:
						{
							series: true,
						},
					},
				},
			});

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
		// Create Favorites Group
		//
		
		if (filterOptions.showFavoritesGroup)
		{
			const favoriteGames = games.filter((game) => game.isFavorite);

			gameGroups.set("Favorites", favoriteGames);

			games = games.filter((game) => !game.isFavorite);
		}

		//
		// Group Games by Group Mode
		//

		switch (filterOptions.groupMode)
		{
			case "name":
			{
				games = games.sort((a, b) => a.sortName.localeCompare(b.sortName));

				for (const game of games)
				{
					const firstLetter = game.sortName.charAt(0).toUpperCase();

					if (!isNaN(parseInt(firstLetter)))
					{
						const numberGroup = gameGroups.get("#") ?? [];

						numberGroup.push(game);

						gameGroups.set("#", numberGroup);
					}
					else
					{
						const groupName = firstLetter.toUpperCase();

						const letterGroup = gameGroups.get(groupName) ?? [];
	
						letterGroup.push(game);
	
						gameGroups.set(groupName, letterGroup);
					}
				}

				break;
			}

			case "lastPlayed":
			{
				const playedGames = games
					.filter((game) => game.lastPlayedDate != null && game.playTimeTotalSeconds > 0)
					.sort((a, b) => b.lastPlayedDate!.getTime() - a.lastPlayedDate!.getTime());

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

				const unplayedGames = games
					.filter((game) => game.lastPlayedDate == null || game.playTimeTotalSeconds == 0)
					.sort((a, b) => a.sortName.localeCompare(b.sortName));

				if (unplayedGames.length > 0)
				{
					gameGroups.set("Unplayed Games", unplayedGames);
				}

				break;
			}

			case "series":
			{
				const gamesBySeries: Map<string, Prisma.GameGetPayload<{ include: { seriesGames: { include: { series: true } } } }>[]> = new Map();

				for (const game of games)
				{
					for (const seriesGame of game.seriesGames)
					{
						const gamesInSeries = gamesBySeries.get(seriesGame.series.name) ?? [];

						gamesInSeries.push(game);

						gamesBySeries.set(seriesGame.series.name, gamesInSeries);
					}
				}

				// TODO: use series sortOrder here (games in the "None" series should be last)
				const series = Array.from(gamesBySeries.entries())
					.map(([ seriesName, gamesInSeries ]) => ({ seriesName, gamesInSeries }))
					.sort((a, b) => a.seriesName.localeCompare(b.seriesName));

				for (const { seriesName, gamesInSeries } of series)
				{
					const sortedGamesInSeries = gamesInSeries
						.map((game) =>
						{
							// Note: Using ! because we know the series game exists
							const seriesGame = game.seriesGames.find((seriesGame) => seriesGame.series.name === seriesName)!;

							return {
								seriesGame,
								game,
							};
						})
						.sort((a, b) =>
						{
							if (a.seriesGame.number < b.seriesGame.number)
							{
								return -1;
							}

							if (a.seriesGame.number > b.seriesGame.number)
							{
								return 1;
							}

							return a.game.sortName.localeCompare(b.game.sortName);
						})
						.map((wrapper) => wrapper.game);

					gameGroups.set(seriesName, sortedGamesInSeries);
				}

				break;
			}
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
						startDate: LGGL_GAME_PLAY_ACTION_SESSION_HISTORY_DAYS >= 1
							? { gt: DateTime.now().minus({ days: LGGL_GAME_PLAY_ACTION_SESSION_HISTORY_DAYS }).toJSDate() }
							: undefined,

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