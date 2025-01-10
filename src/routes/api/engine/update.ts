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
			const engine = await prismaClient.engine.findUnique(
				{
					where:
					{
						id: requestBody.id,
					},
				});

			if (engine == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Engine not found." });
			}

			const engineUpdateData: Prisma.EngineUpdateArgs["data"] = {};

			if (requestBody.updateData.name !== undefined)
			{
				engineUpdateData.name = requestBody.updateData.name;
			}

			if (requestBody.updateData.shortName !== undefined)
			{
				engineUpdateData.shortName = requestBody.updateData.shortName;
			}

			if (Object.keys(engineUpdateData).length == 0)
			{
				return {
					success: true,
				};
			}

			await prismaClient.engine.update(
				{
					where:
					{
						id: engine.id,
					},
					data: engineUpdateData,
				});

			return {
				success: true,
			};
		},
	});