//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as GameModelLib from "../../libs/models/Game.js";

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
		const gameId = parseInt(context.routeParameters.gameId);

		if (isNaN(gameId))
		{
			return;
		}

		const game = await prismaClient.game.findFirst(
			{
				where:
				{
					id: gameId,
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
							{ notes: { sort: "asc", nulls: "first" } },
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
							{ notes: { sort: "asc", nulls: "first" } },
						],
					},
					gameLinks: true,
					gamePlatforms:
					{
						include:
						{
							platform: true,
						},
						orderBy:
						[
							{ platform: { name: "asc" } },
						],
					},
				},
			});

		if (game == null)
		{
			return;
		}

		const groupManager = await GameModelLib.findGroups(prismaClient,
			{
				settings: context.settings,
				selectedGame: game,
			});

		context.renderComponent(view(
			{
				settings: context.settings,
				groupManager,
				game, 
			}));
	},
};