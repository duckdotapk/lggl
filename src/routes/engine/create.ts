//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as EngineModelLib from "../../libs/models/Engine.js";

import { view } from "../../views/engine/create.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/engines/create",
	handler: async (context) =>
	{
		const groupManager = await EngineModelLib.createGroupManager(prismaClient, context.settings, null);

		context.renderComponent(view(
			{
				settings: context.settings,
				groupManager,
			}));
	},
};