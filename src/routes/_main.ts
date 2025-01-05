//
// Imports
//

import * as Fritter from "@donutteam/fritter";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { GameGroupManager } from "../classes/GameGroupManager.js";
import { PlayTimeGameGroupManager } from "../classes/PlayTimeGameGroupManager.js";
import { SeriesGameGroupManager } from "../classes/SeriesGameGroupManager.js";

import { Library } from "../components/Library.js";

import { LGGL_GAME_PLAY_SESSION_HISTORY_DAYS } from "../env/LGGL_GAME_PLAY_SESSION_HISTORY_DAYS.js";

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
		// Group Games by Group Mode
		//

		let gameGroupManager: GameGroupManager;

		switch (filterOptions.groupMode)
		{
			case "name":
			{
				gameGroupManager = new GameGroupManager();

				games = games.sort((a, b) => a.sortName.localeCompare(b.sortName));

				if (filterOptions.showFavoritesGroup)
				{
					gameGroupManager.addGames("Favorites", games.filter((game) => game.isFavorite));
				}

				for (const game of games)
				{
					const firstLetter = game.sortName.charAt(0).toUpperCase();

					!isNaN(parseInt(firstLetter))
						? gameGroupManager.addGame("#", game)
						: gameGroupManager.addGame(firstLetter, game);
				}

				break;
			}

			case "lastPlayed":
			{
				gameGroupManager = new GameGroupManager();

				games = games.sort((a, b) => (b.lastPlayedDate ?? new Date(0)).getTime() - (a.lastPlayedDate ?? new Date(0)).getTime());

				if (filterOptions.showFavoritesGroup)
				{
					gameGroupManager.addGames("Favorites", games.filter((game) => game.isFavorite));
				}

				const playedGames = games.filter((game) => game.lastPlayedDate != null && game.playTimeTotalSeconds > 0);

				for (const playedGame of playedGames)
				{
					gameGroupManager.addGame(playedGame.lastPlayedDate!.getFullYear(), playedGame);
				}

				const unplayedGames = games
					.filter((game) => game.lastPlayedDate == null || game.playTimeTotalSeconds == 0)
					.sort((a, b) => a.sortName.localeCompare(b.sortName));

				gameGroupManager.addGames("Unplayed", unplayedGames);

				break;
			}

			case "series":
			{
				gameGroupManager = new SeriesGameGroupManager();

				const seriesWithGamesBySeriesName: Map<string, 
					{ 
						series: Prisma.SeriesGetPayload<null>, 
						games: typeof games,
					}> = new Map();

				for (const game of games)
				{
					if (game.seriesGames.length === 0)
					{
						continue;
					}

					for (const seriesGame of game.seriesGames)
					{
						const seriesWithGames = seriesWithGamesBySeriesName.get(seriesGame.series.name) ??
						{
							series: seriesGame.series,
							games: [],
						};

						seriesWithGames.games.push(game);

						seriesWithGamesBySeriesName.set(seriesGame.series.name, seriesWithGames);
					}
				}

				for (const [ seriesName, seriesWithGames ] of seriesWithGamesBySeriesName.entries())
				{
					seriesWithGamesBySeriesName.set(seriesName,
						{
							series: seriesWithGames.series,
							games: seriesWithGames.games.sort(
								(a, b) =>
								{
									const seriesGameA = a.seriesGames.find((seriesGame) => seriesGame.series_id = seriesWithGames.series.id)!;

									const seriesGameB = b.seriesGames.find((seriesGame) => seriesGame.series_id = seriesWithGames.series.id)!;

									if (seriesGameA.number < seriesGameB.number)
									{
										return -1;
									}

									if (seriesGameA.number > seriesGameB.number)
									{
										return 1;
									}

									// TODO: sort games by release date after number!

									return a.sortName.localeCompare(b.sortName);
								}),
						});
				}

				const gamesWithoutSeries = games
					.filter((game) => game.seriesGames.length == 0)
					.sort((a, b) => a.sortName.localeCompare(b.sortName));

				if (filterOptions.showFavoritesGroup)
				{
					for (const seriesWithGames of Array.from(seriesWithGamesBySeriesName.values()).sort((a, b) => a.series.name.localeCompare(b.series.name)))
					{
						const favoriteGames = seriesWithGames.games.filter((game) => game.isFavorite);

						gameGroupManager.addGames("Favorites: " + seriesWithGames.series.name, favoriteGames);
					}

					const favoriteGamesWithoutSeries = gamesWithoutSeries.filter((game) => game.isFavorite);

					gameGroupManager.addGames("Favorites: -", favoriteGamesWithoutSeries);
				}

				for (const seriesWithGames of Array.from(seriesWithGamesBySeriesName.values()).sort((a, b) => a.series.name.localeCompare(b.series.name)))
				{
					gameGroupManager.addGames(seriesWithGames.series.name, seriesWithGames.games);
				}

				if (gamesWithoutSeries.length > 0)
				{
					gameGroupManager.addGames("-", gamesWithoutSeries);
				}

				break;
			}

			case "playTime":
			{
				gameGroupManager = new PlayTimeGameGroupManager();

				games = games.sort((a, b) => b.playTimeTotalSeconds - a.playTimeTotalSeconds);

				if (filterOptions.showFavoritesGroup)
				{
					gameGroupManager.addGames("Favorites", games.filter((game) => game.isFavorite));
				}

				const playedGames = games.filter((game) => game.playTimeTotalSeconds > 0);

				if (playedGames.length > 0)
				{
					for (const playedGame of playedGames)
					{
						const playTimeTotalHours = Math.floor(playedGame.playTimeTotalSeconds / 3600);

						if (playTimeTotalHours >= 1000)
						{
							gameGroupManager.addGame("Over 1000 hours", playedGame);
						}
						else if (playTimeTotalHours >= 750)
						{
							gameGroupManager.addGame("Over 750 hours", playedGame);
						}
						else if (playTimeTotalHours >= 500)
						{
							gameGroupManager.addGame("Over 500 hours", playedGame);
						}
						else if (playTimeTotalHours >= 250)
						{
							gameGroupManager.addGame("Over 250 hours", playedGame);
						}
						else if (playTimeTotalHours >= 100)
						{
							gameGroupManager.addGame("Over 100 hours", playedGame);
						}
						else if (playTimeTotalHours >= 50)
						{
							gameGroupManager.addGame("Over 50 hours", playedGame);
						}
						else if (playTimeTotalHours >= 10)
						{
							gameGroupManager.addGame("Over 10 hours", playedGame);
						}
						else if (playTimeTotalHours >= 5)
						{
							gameGroupManager.addGame("Over 5 hours", playedGame);
						}
						else if (playTimeTotalHours >= 4)
						{
							gameGroupManager.addGame("Over 4 hours", playedGame);
						}
						else if (playTimeTotalHours >= 3)
						{
							gameGroupManager.addGame("Over 3 hours", playedGame);
						}
						else if (playTimeTotalHours >= 2)
						{
							gameGroupManager.addGame("Over 2 hours", playedGame);
						}
						else if (playTimeTotalHours >= 1)
						{
							gameGroupManager.addGame("Over 1 hour", playedGame);
						}
						else
						{
							gameGroupManager.addGame("Under 1 hour", playedGame);
						}
					}
				}

				const unplayedGames = games
					.filter((game) => game.playTimeTotalSeconds == 0)
					.sort((a, b) => a.sortName.localeCompare(b.sortName));

				gameGroupManager.addGames("No play time", unplayedGames);
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
						gameDevelopers:
						{
							include:
							{
								company: true,
							},
						},
						gameEngines:
						{
							include:
							{
								engine: true,
							},
						},
						gameLinks: true,
						gamePlayActions: true,
						gamePlaySessions:
						{
							where:
							{
								startDate: LGGL_GAME_PLAY_SESSION_HISTORY_DAYS != -1
									? { gte: DateTime.now().minus({ days: LGGL_GAME_PLAY_SESSION_HISTORY_DAYS }).toJSDate() }
									: undefined,
							},
							include:
							{
								platform: true,
							},
							orderBy:
							{
								startDate: "desc",
							},
						},
						gamePublishers:
						{
							include:
							{
								company: true,
							},
						},
					},
				})
			: null;

		//
		// Render Library
		//

		context.fritterResponse.setContentType("text/html");
		context.fritterResponse.setBody(Library(
			{
				searchParameters,
				filterOptions,
				gameGroupManager,
				selectedGame, 
			}).renderToString());
	},
};