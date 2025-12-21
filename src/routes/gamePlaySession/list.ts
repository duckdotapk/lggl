//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as GameModelLib from "../../libs/models/Game.js";

import { view } from "../../views/gamePlaySession/list.js";

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

const gamePlaySessionsPerPage = 10;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/gamePlaySessions/list/:gameId",
	handler: async (context) =>
	{
		const gameId = parseInt(context.routeParameters.gameId);

		if (isNaN(gameId))
		{
			return;
		}

		const game = await prismaClient.game.findFirst(
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

		const groupManager = await GameModelLib.createGroupManager(prismaClient, context.settings, game);

		const gamePlaySessions = await prismaClient.gamePlaySession.findMany(
			{
				where:
				{
					game_id: game.id,
				},
				include:
				{
					platform: true,
				},
				orderBy:
				{
					startDate: "desc",
				},
				take: gamePlaySessionsPerPage,
				skip: (context.currentPageNumber - 1) * gamePlaySessionsPerPage,
			});

		const gamePlaySessionCount = await prismaClient.gamePlaySession.count(
			{
				where:
				{
					game_id: game.id,
				},
			});

		context.renderComponent(view(
			{
				settings: context.settings,
				groupManager,
				game, 
				gamePlaySessions,
				gamePlaySessionCount,
			}));
	},
};