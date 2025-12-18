//
// Imports
//

import { RouterMiddleware } from "@lorenstuff/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import { createCompanyGroupManager } from "../../libs/models/Company.js";

import { view } from "../../views/company/_main.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/companies",
	handler: async (context) =>
	{
		const groupManager = await createCompanyGroupManager(prismaClient, context.settings, null);

		context.renderComponent(view(
		{
			settings: context.settings,
			groupManager,
		}));
	},
};