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
		const series = await prismaClient.series.findUnique(
			{
				where:
				{
					id: requestBody.series_id,
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

		const game = await prismaClient.game.findUnique(
		{
			where:
			{
				id: requestBody.game_id,
			},
		});

		if (game == null)
		{
			throw new ApiError(
			{
				code: "NOT_FOUND",
				message: "Game not found.",
			});
		}

		await prismaClient.seriesGame.create(
		{
			data:
			{
				number: requestBody.number,

				game_id: requestBody.game_id,
				series_id: requestBody.series_id,
			},
		});

		return {
			success: true,
		};
	},
});