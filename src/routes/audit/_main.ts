//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as AuditLib from "../../libs/Audit.js";

import { view } from "../../views/audit/_main.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/audit",
	handler: async (context) =>
	{
		const games = await prismaClient.game.findMany(
			{
				include:
				{
					gameCompanies: true,
					gameEngines: true,
					gameGenres: true,
					gameInstallations: true,
					gameLinks: true,
					gamePlatforms: true,
					gamePlayActions: true,
					gamePlaySessions: true,
					seriesGames: true,
				},
				orderBy:
				{
					sortName: "asc",
				},
			});

		const problemLists: AuditLib.ProblemList[] = [];

		for (const game of games)
		{
			const problemList = await AuditLib.auditGame(game, false);

			if (problemList.problems.length == 0)
			{
				continue;
			}

			problemLists.push(problemList);
		}

		context.renderComponent(view(
			{
				problemLists,
			}));
	},
};