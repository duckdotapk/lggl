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
			const series = await prismaClient.series.findUnique(
				{
					where:
					{
						id: requestBody.series_id,
					},
				});

			if (series == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Series not found." });
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
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Game not found." });
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