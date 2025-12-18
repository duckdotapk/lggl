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
		const existingPlatform = await prismaClient.platform.findUnique(
		{
			where:
			{
				name: requestBody.name,
			},
		});

		if (existingPlatform != null)
		{
			throw new ApiError(
			{
				code: "DATA_ALREADY_EXISTS",
				message: "A Platform with this name already exists.",
			});
		}

		const platform = await prismaClient.platform.create(
		{
			data:
			{
				iconName: requestBody.iconName,
				name: requestBody.name,
			},
		});

		return {
			success: true,
			platform,
		};
	},
});