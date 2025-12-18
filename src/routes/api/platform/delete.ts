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
		const platform = await prismaClient.platform.findUnique(
		{
			where:
			{
				id: requestBody.id,
			},
		});

		if (platform == null)
		{
			throw new ApiError(
			{
				code: "NOT_FOUND",
				message: "Platform not found.",
			});
		}

		await prismaClient.platform.delete(
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