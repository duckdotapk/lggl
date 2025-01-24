//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import * as GameModelLib from "../../../libs/models/Game.js";
import * as GamePlayActionModelLib from "../../../libs/models/GamePlayAction.js";

import * as Schemas from "./execute.schemas.js";

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
		handler: async (requestBody, context) =>
		{
			const gamePlayAction = await prismaClient.gamePlayAction.findUnique(
				{
					where:
					{
						id: requestBody.id,
					},
					include:
					{
						game: true,
					},
				});

			if (gamePlayAction == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Game play action not found." });
			}

			if (GameModelLib.hasActiveSession(gamePlayAction.game))
			{
				throw new FritterApiUtilities.APIError({ code: "GAME_HAS_ACTIVE_SESSION", message: "Game has an active session." });
			}

			const launchGameResult = await GamePlayActionModelLib.execute(gamePlayAction, context.settings);

			if (!launchGameResult.success)
			{
				throw new FritterApiUtilities.APIError({ code: "LAUNCH_FAILED", message: launchGameResult.message });
			}

			return {
				success: true,
			};
		},
	});