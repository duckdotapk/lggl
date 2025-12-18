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
		const series = await prismaClient.series.findUnique(
		{
			where:
			{
				id: requestBody.id,
			},
		});

		if (series == null)
		{
			throw new ApiError(
			{
				code: "NOT_FOUND",
				message: "Series not found.",
			});
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