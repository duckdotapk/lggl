//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as GameModelLib from "../../libs/models/Game.js";

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

		const groupManager = await GameModelLib.findGroups(prismaClient,
			{
				settings: context.settings,
				selectedGame: game,
			});

		const companies = await prismaClient.company.findMany(
			{
				orderBy:
				[
					{ name: "asc" },
				],
			});

		const engines = await prismaClient.engine.findMany(
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

		const gameEngines = await prismaClient.gameEngine.findMany(
			{
				where:
				{
					game_id: game.id,
				},
				include:
				{
					engine: true,
				},
				orderBy:
				[
					{ engine: { shortName: "asc" } },
				],
			});

		const gameInstallations = await prismaClient.gameInstallation.findMany(
			{
				where:
				{
					game_id: game.id,
				},
				orderBy:
				[
					{ path: "asc" },
				],
			});

		const gamePlatforms = await prismaClient.gamePlatform.findMany(
			{
				where:
				{
					game_id: game.id,
				},
				orderBy:
				[
					{ platform: { name: "asc" } },
				],
			});

		const gamePlayActions = await prismaClient.gamePlayAction.findMany(
			{
				where:
				{
					game_id: game.id,
				},
				orderBy:
				[
					{ isArchived: "asc" },
					{ name: "asc" },
				],
			});

		const platforms = await prismaClient.platform.findMany(
			{
				orderBy:
				[
					{ name: "asc" },
				],
			});

		context.renderComponent(view(
			{
				settings: context.settings,
				groupManager,
				companies,
				engines,
				game,
				gameCompanies,
				gameEngines,
				gameInstallations,
				gamePlatforms,
				gamePlayActions,
				platforms,
			}));
	},
};