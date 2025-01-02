//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";

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
			const game = await prismaClient.game.findUnique(
				{
					where:
					{
						id: requestBody.id,
					},
				});

			if (game == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Game not found." });
			}

			await prismaClient.game.update(
				{
					where:
					{
						id: game.id,
					},
					data:
					{
						isEarlyAccess: requestBody.updateData.isEarlyAccess,
						isFavorite: requestBody.updateData.isFavorite,
						isHidden: requestBody.updateData.isHidden,
						isNsfw: requestBody.updateData.isNsfw,
						isShelved: requestBody.updateData.isShelved,
					},
				});

			return {
				success: true,
			};
		},
	});