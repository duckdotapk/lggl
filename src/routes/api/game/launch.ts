//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import * as LauncherLib from "../../../libs/Launcher.js";

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
			//
			// Find Game
			//

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

			//
			// Find Game Play Action
			//

			const gamePlayAction = await prismaClient.gamePlayAction.findUnique(
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

			//
			// Launch Game
			//

			const launchGameResult = await LauncherLib.launchGame(game, gamePlayAction);

			if (!launchGameResult.success)
			{
				throw new FritterApiUtilities.APIError({ code: "LAUNCH_FAILED", message: launchGameResult.message });
			}

			//
			// Return
			//

			return {
				success: true,
			};
		},
	});