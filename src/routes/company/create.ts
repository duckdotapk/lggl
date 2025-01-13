//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as CompanyModelLib from "../../libs/models/Company.js";

import { view } from "../../views/company/create.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/companies/create",
	handler: async (context) =>
	{
		const groups = await CompanyModelLib.findGroups(prismaClient,
			{ 
				mode: "name",
				selectedCompany: null,
			});

		context.renderComponent(view(
			{
				groups,
			}));
	},
};