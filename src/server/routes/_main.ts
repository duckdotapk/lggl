//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../_shared/instances/prismaClient.js";

import { Library, LibraryOptions } from "../components/Library.js";

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
		// Create Game Groups
		//

		const gameGroups: LibraryOptions["gameGroups"] = new Map();
		
		if (filterOptions.showFavoritesGroup)
		{
			const favoriteGames = await prismaClient.game.findMany(
				{
					where:
					{
						isFavorite: true,
						isHidden: filterOptions.showHiddenGames ? undefined : false,
						isNsfw: filterOptions.showNsfwGames ? undefined : false,
					},
					orderBy:
					[
						{
							sortName: "asc",
						},
					],
				});

			gameGroups.set("Favorites", favoriteGames);
		}

		switch (filterOptions.groupMode)
		{
			case "lastPlayed":
			{
				const games = await prismaClient.game.findMany(
					{
						where:
						{
							isHidden: filterOptions.showHiddenGames ? undefined : false,
							isNsfw: filterOptions.showNsfwGames ? undefined : false,
						},
						orderBy:
						[
							{
								lastPlayedDate:
								{
									sort: "desc",
									nulls: "last",
								},
							},
							{
								sortName: "asc",
							},
						],
					});

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

			case "series":
			{
				const seriesList = await prismaClient.series.findMany(
					{
						include:
						{
							seriesGames:
							{
								where:
								{
									game:
									{
										isHidden: filterOptions.showHiddenGames ? undefined : false,
										isNsfw: filterOptions.showNsfwGames ? undefined : false,
									},
								},
								orderBy:
								[
									{
										sortOrder: "asc",
									},
									{
										game:
										{
											sortName: "asc",
										},
									},
								],
								include:
								{
									game: true,
								},
							},
						},
						orderBy:
						[
							{
								sortOrder: "desc",
							},
							{
								name: "asc",
							},
						],
					});

				for (const series of seriesList)
				{
					gameGroups.set(series.name, series.seriesGames.map((seriesGame) => seriesGame.game));
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