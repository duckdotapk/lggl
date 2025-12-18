//
// Imports
//

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import { ApiError, createEndpointRoute } from "../../../libs/Api.js";

import * as schema from "./findOne.schemas.js";

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
		const game = await prismaClient.game.findUnique(
		{
			where:
			{
				id: requestBody.id,
			},
		});

		if (game == null)
		{
			throw new ApiError(
			{
				code: "NOT_FOUND",
				message: "Game not found.",
			});
		}

		return {
			success: true,
			game,
		};
	},
});