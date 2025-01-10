//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

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

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
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

		context.renderComponent(view(
			{
				company,
			}));
	},
};