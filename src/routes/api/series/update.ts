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

			const seriesUpdateData: Prisma.SeriesUpdateArgs["data"] = {};

			if (requestBody.updateData.name !== undefined)
			{
				seriesUpdateData.name = requestBody.updateData.name;
			}

			if (Object.keys(seriesUpdateData).length == 0)
			{
				return {
					success: true,
				};
			}

			await prismaClient.series.update(
				{
					where:
					{
						id: series.id,
					},
					data: seriesUpdateData,
				});

			return {
				success: true,
			};
		},
	});