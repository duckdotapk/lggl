//
// Imports
//

import * as Fritter from "@donutteam/fritter";
import { DateTime } from "luxon";

import { LGGL_GAME_PLAY_SESSION_HISTORY_DAYS } from "../../env/LGGL_GAME_PLAY_SESSION_HISTORY_DAYS.js";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as LauncherLib from "../../libs/Launcher.js";

import { view } from "../../views/game/view.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext &
{
	routeParameters:
	{
		gameId: string;
	};
};

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/games/view/:gameId",
	handler: async (context) =>
	{
		const selectedGameId = parseInt(context.routeParameters.gameId);

		if (isNaN(selectedGameId))
		{
			return;
		}

		const selectedGame = await prismaClient.game.findFirst(
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
						orderBy:
						[
							{ company: { name: "asc" } },
						],
					},
					gameEngines:
					{
						include:
						{
							engine: true,
						},
						orderBy:
						[
							{ engine: { name: "asc" } },
							{ version: "asc" },
						],
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
			});

		if (selectedGame == null)
		{
			return;
		}

		const gameGroupManager = await LauncherLib.fetchGameGroupManager(context.settings);

		context.renderComponent(view(
			{
				settings: context.settings,
				gameGroupManager,
				selectedGame, 
			}));
	},
};