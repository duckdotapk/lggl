//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";
import { Prisma } from "@prisma/client";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import * as Schemas from "./update.schemas.js";

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
			const gameEngine = await prismaClient.gameEngine.findUnique(
				{
					where:
					{
						id: requestBody.id,
					},
				});

			if (gameEngine == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "GameEngine not found." });
			}

			const gameEngineUpdateData: Prisma.GameEngineUpdateArgs["data"] = {};

			if (requestBody.updateData.notes !== undefined)
			{
				gameEngineUpdateData.notes = requestBody.updateData.notes;
			}

			if (requestBody.updateData.version !== undefined)
			{
				gameEngineUpdateData.version = requestBody.updateData.version;
			}

			if (requestBody.updateData.engine_id !== undefined)
			{
				const engine = await prismaClient.engine.findUnique(
					{
						where:
						{
							id: requestBody.updateData.engine_id,
						},
					});
				
				if (engine == null)
				{
					throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Engine not found." });
				}

				gameEngineUpdateData.engine_id = engine.id;
			}

			if (Object.keys(gameEngineUpdateData).length == 0)
			{
				return {
					success: true,
				};
			}

			await prismaClient.gameEngine.update(
				{
					where:
					{
						id: gameEngine.id,
					},
					data: gameEngineUpdateData,
				});

			return {
				success: true,
			};
		},
	});