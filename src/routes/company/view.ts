//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as CompanyModelLib from "../../libs/models/Company.js";

import { view } from "../../views/company/view.js";

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
	path: "/companies/view/:companyId",
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

		const groupManager = await CompanyModelLib.createGroupManager(prismaClient, context.settings, company);

		const gamesDeveloped = await prismaClient.game.findMany(
			{
				where:
				{
					gameCompanies:
					{
						some:
						{
							type: "DEVELOPER",

							company_id: companyId,
						},
					},
				},
				orderBy:
				[
					{ sortName: "asc" },
				],
			});

		const gamesPublished = await prismaClient.game.findMany(
			{
				where:
				{
					gameCompanies:
					{
						some:
						{
							type: "PUBLISHER",

							company_id: companyId,
						},
					},
				},
				orderBy:
				[
					{ sortName: "asc" },
				],
			});

		context.renderComponent(view(
			{
				settings: context.settings,
				groupManager,
				company,
				gamesDeveloped,
				gamesPublished,
			}));
	},
};