//
// Imports
//

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import { ApiError, createEndpointRoute } from "../../../libs/Api.js";

import * as schema from "./delete.schemas.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route = createEndpointRoute<RouteFritterContext, typeof schema.RequestBodySchema, typeof schema.ResponseBodySchema>(
{
	schema,
	middlewares: [],
	handler: async (requestBody) =>
	{
		const gameEngine = await prismaClient.gameEngine.findUnique(
		{
			where:
			{
				id: requestBody.id,
			},
		});

		if (gameEngine == null)
		{
			throw new ApiError(
			{
				code: "NOT FOUND",
				message: "GameEngine not found.",
			});
		}

		await prismaClient.gameEngine.delete(
		{
			where:
			{
				id: requestBody.id,
			},
		});

		return {
			success: true,
		};
	},
});