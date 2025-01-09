//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import { view } from "../../views/game/edit.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext &
{
	routeParameters:
	{
		gameId: string;
	};
};

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/games/edit/:gameId",
	handler: async (context) =>
	{
		const gameId = parseInt(context.routeParameters.gameId);

		if (isNaN(gameId))
		{
			return;
		}

		const game = await prismaClient.game.findUnique(
			{
				where:
				{
					id: gameId,
				},
			});

		if (game == null)
		{
			return;
		}

		const companies = await prismaClient.company.findMany(
			{
				orderBy:
				[
					{ name: "asc" },
				],
			});

		const gameCompanies = await prismaClient.gameCompany.findMany(
			{
				where:
				{
					game_id: game.id,
				},
				include:
				{
					company: true,
				},
				orderBy:
				[
					{ type: "asc" },
					{ company: { name: "asc" } },
				],
			});

		context.renderComponent(view(
			{
				settings: context.settings,
				companies,
				game,
				gameCompanies,
			}));
	},
};