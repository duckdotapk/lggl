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
		const existingSeries = await prismaClient.series.findUnique(
		{
			where:
			{
				name: requestBody.name,
			},
		});

		if (existingSeries != null)
		{
			throw new ApiError(
			{
				code: "DATA_ALREADY_EXISTS",
				message: "A Series with this name already exists.",
			});
		}

		const series = await prismaClient.series.create(
		{
			data:
			{
				name: requestBody.name,
			},
		});

		return {
			success: true,
			series,
		};
	},
});