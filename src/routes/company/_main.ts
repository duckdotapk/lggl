//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import { view } from "../../views/company/_main.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/companies",
	handler: async (context) =>
	{
		const companies = await prismaClient.company.findMany(
			{
				orderBy:
				[
					{ name: "asc" },
				],
			});

		context.renderComponent(view(
			{
				companies,
			}));
	},
};