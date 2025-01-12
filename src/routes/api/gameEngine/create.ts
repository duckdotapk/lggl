//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import * as Schemas from "./create.schemas.js";

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
						id: requestBody.game_id,
					},
				});

			if (game == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Game not found." });
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
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Engine not found." });
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