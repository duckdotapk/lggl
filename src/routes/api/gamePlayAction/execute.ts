//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

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

			const executeGamePlayActionError = await GamePlayActionModelLib.execute(gamePlayAction, context.settings);

			if (executeGamePlayActionError != null)
			{
				console.error("[/api/gamePlayActions/execute] Failed to execute game play action:", executeGamePlayActionError);

				throw new FritterApiUtilities.APIError({ code: "EXECUTION_FAILED", message: executeGamePlayActionError });
			}

			return {
				success: true,
			};
		},
	});