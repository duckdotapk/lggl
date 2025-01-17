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
			const gameLink = await prismaClient.gameLink.findUnique(
				{
					where:
					{
						id: requestBody.id,
					},
				});

			if (gameLink == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT FOUND", message: "GameLink not found." });
			}

			await prismaClient.gameLink.delete(
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