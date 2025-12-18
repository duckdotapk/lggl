//
// Imports
//

import { RouterMiddleware } from "@lorenstuff/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import { createCompanyGroupManager } from "../../libs/models/Company.js";

import { view } from "../../views/company/edit.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext &
{
	routeParameters:
	{
		companyId: string;
	};
};

export const route: RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/companies/edit/:companyId",
	handler: async (context) =>
	{
		const companyId = parseInt(context.routeParameters.companyId);
		if (isNaN(companyId))
		{
			return;
		}

		const company = await prismaClient.company.findUnique(
		{
			where:
			{
				id: companyId,
			},
		});
		if (company == null)
		{
			return;
		}

		const groupManager = await createCompanyGroupManager(
			prismaClient,
			context.settings,
			company,
		);

		context.renderComponent(view(
		{
			settings: context.settings,
			groupManager,
			company,
		}));
	},
};