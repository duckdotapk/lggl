//
// Imports
//

import { RouterMiddleware } from "@lorenstuff/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import { createEngineGroupManager } from "../../libs/models/Engine.js";

import { view } from "../../views/engine/create.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/engines/create",
	handler: async (context) =>
	{
		const groupManager = await createEngineGroupManager(prismaClient, context.settings, null);

		context.renderComponent(view(
		{
			settings: context.settings,
			groupManager,
		}));
	},
};