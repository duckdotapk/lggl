//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as SeriesModelLib from "../../libs/models/Series.js";

import { view } from "../../views/series/_main.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/series",
	handler: async (context) =>
	{
		const groupManager = await SeriesModelLib.findGroups(prismaClient,
			{
				settings: context.settings,
				selectedSeries: null,
			});

		context.renderComponent(view(
			{
				settings: context.settings,
				groupManager,
			}));
	},
};