//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as PlatformModelLib from "../../libs/models/Platform.js";

import { view } from "../../views/platform/_main.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/platforms",
	handler: async (context) =>
	{
		const groupManager = await PlatformModelLib.findGroups(prismaClient,
			{
				settings: context.settings,
				selectedPlatform: null,
			});

		context.renderComponent(view(
			{
				groupManager,
			}));
	},
};