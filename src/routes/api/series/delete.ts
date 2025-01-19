//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import * as Schemas from "./delete.schemas.js";

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
			const series = await prismaClient.series.findUnique(
				{
					where:
					{
						id: requestBody.id,
					},
				});

			if (series == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Series not found." });
			}

			await prismaClient.series.delete(
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