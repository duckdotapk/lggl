//
// Imports
//

import { RouterMiddleware } from "@lorenstuff/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import { createSeriesGroupManager } from "../../libs/models/Series.js";

import { view } from "../../views/series/create.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/series/create",
	handler: async (context) =>
	{
		const groupManager = await createSeriesGroupManager(prismaClient, context.settings, null);

		context.renderComponent(view(
		{
			settings: context.settings,
			groupManager,
		}));
	},
};