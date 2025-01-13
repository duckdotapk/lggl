//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

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
		const platforms = await prismaClient.platform.findMany(
			{
				orderBy:
				[
					{ name: "asc" },
				],
			});

		context.renderComponent(view(
			{
				platforms,
			}));
	},
};