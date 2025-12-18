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
		const seriesGame = await prismaClient.seriesGame.findUnique(
		{
			where:
			{
				id: requestBody.id,
			},
		});

		if (seriesGame == null)
		{
			throw new ApiError(
			{
				code: "NOT_FOUND",
				message: "SeriesGame not found.",
			});
		}

		const seriesGameUpdateData: Prisma.SeriesGameUpdateArgs["data"] = {};

		if (requestBody.updateData.number !== undefined)
		{
			seriesGameUpdateData.number = requestBody.updateData.number;
		}

		if (requestBody.updateData.game_id !== undefined)
		{
			const game = await prismaClient.game.findUnique(
			{
				where:
				{
					id: requestBody.updateData.game_id,
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

			seriesGameUpdateData.game_id = game.id;
		}
		
		if (Object.keys(seriesGameUpdateData).length == 0)
		{
			return {
				success: true,
			};
		}

		await prismaClient.seriesGame.update(
		{
			where:
			{
				id: seriesGame.id,
			},
			data: seriesGameUpdateData,
		});

		return {
			success: true,
		};
	},
});