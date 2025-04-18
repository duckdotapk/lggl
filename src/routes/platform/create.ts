//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as PlatformModelLib from "../../libs/models/Platform.js";

import { view } from "../../views/platform/create.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/platforms/create",
	handler: async (context) =>
	{
		const groupManager = await PlatformModelLib.createGroupManager(prismaClient, context.settings, null);

		context.renderComponent(view(
			{
				settings: context.settings,
				groupManager,
			}));
	},
};