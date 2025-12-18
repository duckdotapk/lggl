//
// Imports
//

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import { ApiError, createEndpointRoute } from "../../../libs/Api.js";
import { executeGamePlayAction } from "../../../libs/models/GamePlayAction.js";

import * as schema from "./execute.schemas.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route = createEndpointRoute<RouteFritterContext, typeof schema.RequestBodySchema, typeof schema.ResponseBodySchema>(
{
	schema,
	middlewares: [],
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
			throw new ApiError(
			{
				code: "NOT_FOUND",
				message: "Game play action not found.",
			});
		}

		const executeGamePlayActionError = await executeGamePlayAction(
			gamePlayAction,
			context.settings,
		);

		if (executeGamePlayActionError != null)
		{
			console.error(
				"[/api/gamePlayActions/execute] Failed to execute game play action:",
				executeGamePlayActionError,
			);

			throw new ApiError(
			{
				code: "EXECUTION_FAILED",
				message: executeGamePlayActionError,
			});
		}

		return {
			success: true,
		};
	},
});