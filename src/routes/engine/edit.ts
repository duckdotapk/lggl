//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as EngineModelLib from "../../libs/models/Engine.js";

import { view } from "../../views/engine/edit.js";

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
	path: "/engines/edit/:engineId",
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

		const groupManager = await EngineModelLib.createGroupManager(prismaClient, context.settings, engine);

		context.renderComponent(view(
			{
				settings: context.settings,
				groupManager,
				engine,
			}));
	},
};