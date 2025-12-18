//
// Imports
//

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import { ApiError, createEndpointRoute } from "../../../libs/Api.js";

import * as schema from "./create.schemas.js";

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
				id: requestBody.game_id,
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

		const engine = await prismaClient.engine.findUnique(
		{
			where:
			{
				id: requestBody.engine_id,
			},
		});

		if (engine == null)
		{
			throw new ApiError(
			{
				code: "NOT_FOUND",
				message: "Engine not found.",
			});
		}

		await prismaClient.gameEngine.create(
		{
			data:
			{
				notes: requestBody.notes,
				version: requestBody.version,

				engine_id: engine.id,
				game_id: game.id,
			},
		});

		return {
			success: true,
		};
	},
});