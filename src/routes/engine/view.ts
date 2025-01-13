//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as EngineModelLib from "../../libs/models/Engine.js";

import { view } from "../../views/engine/view.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext &
{
	routeParameters:
	{
		engineId: string;
	};
};

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/engines/view/:engineId",
	handler: async (context) =>
	{
		const engineId = parseInt(context.routeParameters.engineId);

		if (isNaN(engineId))
		{
			return;
		}

		const engine = await prismaClient.engine.findUnique(
			{
				where:
				{
					id: engineId,
				},
			});

		if (engine == null)
		{
			return;
		}
		
		const groupManager = await EngineModelLib.findGroups(prismaClient,
			{
				settings: context.settings,
				selectedEngine: engine,
			});

		const games = await prismaClient.game.findMany(
			{
				where:
				{
					gameEngines:
					{
						some:
						{
							engine_id: engineId,
						},
					},
				},
				orderBy:
				[
					{ sortName: "asc" },
				],
			});

		context.renderComponent(view(
			{
				settings: context.settings,
				groupManager,
				engine,
				games,
			}));
	},
};