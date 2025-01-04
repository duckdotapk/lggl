//
// Imports
//

import * as Fritter from "@donutteam/fritter";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { Library, LibraryOptions } from "../components/Library.js";

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
		// Initialise Game Groups Map
		//

		const gameGroups: LibraryOptions["gameGroups"] = new Map();

		//
		// Group Games by Group Mode
		//

		switch (filterOptions.groupMode)
		{
			case "name":
			{
				games = games.sort((a, b) => a.sortName.localeCompare(b.sortName));

				if (filterOptions.showFavoritesGroup)
				{
					const favoriteGames = games.filter((game) => game.isFavorite);

					if (favoriteGames.length > 0)
					{
						gameGroups.set("Favorites", favoriteGames);
					}
				}

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
				games = games.sort((a, b) => (b.lastPlayedDate ?? new Date(0)).getTime() - (a.lastPlayedDate ?? new Date(0)).getTime());

				if (filterOptions.showFavoritesGroup)
				{
					const favoriteGames = games.filter((game) => game.isFavorite);

					if (favoriteGames.length > 0)
					{
						gameGroups.set("Favorites", favoriteGames);
					}
				}

				const playedGames = games.filter((game) => game.lastPlayedDate != null && game.playTimeTotalSeconds > 0);

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
				//
				// Group Games by Series
				//

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

				//
				// Sort Games in Each Series
				//

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

				//
				// Group Games with No Series
				//

				const gamesWithoutSeries = games
					.filter((game) => game.seriesGames.length == 0)
					.sort((a, b) => a.sortName.localeCompare(b.sortName));

				if (filterOptions.showFavoritesGroup)
				{
					for (const seriesWithGames of Array.from(seriesWithGamesBySeriesName.values()).sort((a, b) => a.series.name.localeCompare(b.series.name)))
					{
						const favoriteGames = seriesWithGames.games.filter((game) => game.isFavorite);

						if (favoriteGames.length > 0)
						{
							const favoritesGroup = gameGroups.get("Favorites: " + seriesWithGames.series.name) ?? [];

							favoritesGroup.push(...favoriteGames);

							gameGroups.set("Favorites: " + seriesWithGames.series.name, favoritesGroup);
						}
					}

					const favoriteGamesWithoutSeries = gamesWithoutSeries.filter((game) => game.isFavorite);

					if (favoriteGamesWithoutSeries.length > 0)
					{
						const favoritesGroup = gameGroups.get("Favorites: -") ?? [];

						favoritesGroup.push(...favoriteGamesWithoutSeries);

						gameGroups.set("Favorites: -", favoritesGroup);
					}
				}

				for (const seriesWithGames of Array.from(seriesWithGamesBySeriesName.values()).sort((a, b) => a.series.name.localeCompare(b.series.name)))
				{
					gameGroups.set(seriesWithGames.series.name, seriesWithGames.games);
				}

				if (gamesWithoutSeries.length > 0)
				{
					gameGroups.set("-", gamesWithoutSeries);
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
				gameGroups, 
				selectedGame, 
			}).renderToString());
	},
};