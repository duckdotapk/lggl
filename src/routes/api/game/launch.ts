//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import * as GameLauncherLib from "../../../libs/GameLauncher.js";

import * as Schemas from "./launch.schemas.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route = FritterApiUtilities.createEndpointRoute<RouteFritterContext, typeof Schemas.RequestBodySchema, typeof Schemas.ResponseBodySchema>(
	{
		method: Schemas.method,
		path: Schemas.path,
		middlewares: [],
		requestBodySchema: Schemas.RequestBodySchema,
		responseBodySchema: Schemas.ResponseBodySchema,
		handler: async (requestBody) =>
		{
			const game = await prismaClient.game.findUnique(
				{
					where:
					{
						id: requestBody.id,
					},
				});

			if (game == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Game not found." });
			}

			const gamePlayAction = await prismaClient.gamePlayAction.findFirst(
				{
					where:
					{
						id: requestBody.gamePlayAction_id,

						game_id: game.id,
					},
				});

			if (gamePlayAction == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Game play action not found." });
			}

			try
			{
				await GameLauncherLib.launchGame(game, gamePlayAction);
			}
			catch (error)
			{
				console.error("[" + Schemas.path + "] Error launching game:", error);

				throw new FritterApiUtilities.APIError(
					{ 
						code: "LAUNCH_FAILED", 
						message: error instanceof Error ? error.message : "Unknown error launching game.",
					});
			}

			return {
				success: true,
			};
		},
	});