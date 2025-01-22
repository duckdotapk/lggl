//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as GameModelLib from "../../libs/models/Game.js";

import { view } from "../../views/game/_main.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/games",
	handler: async (context) =>
	{
		const groupManager = await GameModelLib.createGroupManager(prismaClient, context.settings, null);

		context.renderComponent(view(
			{
				settings: context.settings,
				groupManager,
			}));
	},
};