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
		const existingCompany = await prismaClient.company.findUnique(
		{
			where:
			{
				name: requestBody.name,
			},
		});

		if (existingCompany != null)
		{
			throw new ApiError(
			{
				code: "DATA_ALREADY_EXISTS",
				message: "A company with this name already exists.",
			});
		}

		const company = await prismaClient.company.create(
		{
			data:
			{
				name: requestBody.name,
			},
		});

		return {
			success: true,
			company,
		};
	},
});