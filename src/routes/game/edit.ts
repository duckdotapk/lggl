//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import { view } from "../../views/game/edit.js";

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
	path: "/games/edit/:gameId",
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
				},
			});

		if (game == null)
		{
			return;
		}

		context.renderComponent(view(
			{
				settings: context.settings,
				game,
			}));
	},
};