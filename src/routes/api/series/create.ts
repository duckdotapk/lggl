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
			const existingSeries = await prismaClient.series.findUnique(
				{
					where:
					{
						name: requestBody.name,
					},
				});

			if (existingSeries != null)
			{
				throw new FritterApiUtilities.APIError({ code: "DATA_ALREADY_EXISTS", message: "A Series with this name already exists." });
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