//
// Imports
//

import * as Fritter from "@donutteam/fritter";
import { DateTime } from "luxon";

import { GameGroupManager } from "../classes/GameGroupManager.js";
import { LastPlayedGameGroupManager } from "../classes/LastPlayedGameGroupManager.js";
import { NameGameGroupManager } from "../classes/NameGameGroupManager.js";
import { PlayTimeGameGroupManager } from "../classes/PlayTimeGameGroupManager.js";
import { SeriesGameGroupManager } from "../classes/SeriesGameGroupManager.js";

import { LGGL_GAME_PLAY_SESSION_HISTORY_DAYS } from "../env/LGGL_GAME_PLAY_SESSION_HISTORY_DAYS.js";

import { prismaClient } from "../instances/prismaClient.js";
import { ServerFritterContext } from "../instances/server.js";

import * as LibrarySchemaLib from "../libs/schemas/Library.js";

import { view } from "../views/_main.js";

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
			case "lastPlayed":
				gameGroupManager = new LastPlayedGameGroupManager(filterOptions, games);

				break;

			case "name":
				gameGroupManager = new NameGameGroupManager(filterOptions, games);

				break;

			case "playTime":
				gameGroupManager = new PlayTimeGameGroupManager(filterOptions, games);

				break;

			case "series":
				gameGroupManager = new SeriesGameGroupManager(filterOptions, games);

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
						gameCompanies:
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
							take: 5,
						},
					},
				})
			: null;

		//
		// Render Library
		//

		context.renderComponent(view(
			{
				searchParameters,
				filterOptions,
				gameGroupManager,
				selectedGame, 
			}));
	},
};