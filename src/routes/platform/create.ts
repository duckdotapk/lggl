//
// Imports
//

import { RouterMiddleware } from "@lorenstuff/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import { createPlatformGroupManager } from "../../libs/models/Platform.js";

import { view } from "../../views/platform/create.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/platforms/create",
	handler: async (context) =>
	{
		const groupManager = await createPlatformGroupManager(prismaClient, context.settings, null);

		context.renderComponent(view(
		{
			settings: context.settings,
			groupManager,
		}));
	},
};