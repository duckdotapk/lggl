//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as EngineModelLib from "../../libs/models/Engine.js";

import { view } from "../../views/engine/_main.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/engines",
	handler: async (context) =>
	{
		const groupManager = await EngineModelLib.findGroups(prismaClient,
			{ 
				settings: context.settings,
				selectedEngine: null,
			});

		context.renderComponent(view(
			{
				groupManager,
			}));
	},
};