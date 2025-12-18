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
		const existingEngine = await prismaClient.engine.findUnique(
		{
			where:
			{
				name: requestBody.name,
			},
		});

		if (existingEngine != null)
		{
			throw new ApiError(
			{
				code: "DATA_ALREADY_EXISTS",
				message: "A engine with this name already exists.",
			});
		}

		const engine = await prismaClient.engine.create(
		{
			data:
			{
				name: requestBody.name,
				shortName: requestBody.shortName,
			},
		});

		return {
			success: true,
			engine,
		};
	},
});