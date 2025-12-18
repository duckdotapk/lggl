//
// Imports
//

import { Prisma } from "@prisma/client";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import { ApiError, createEndpointRoute } from "../../../libs/Api.js";

import * as schema from "./update.schemas.js";

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
		const engine = await prismaClient.engine.findUnique(
			{
				where:
				{
					id: requestBody.id,
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