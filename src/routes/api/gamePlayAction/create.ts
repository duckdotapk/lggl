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

			await prismaClient.gamePlayAction.create(
				{
					data:
					{
						name: requestBody.name,
						type: requestBody.type,
						path: requestBody.path,
						trackingPath: requestBody.trackingPath,

						// TODO: validate this is a JSON string array before shoving it into the db
						argumentsJson: requestBody.argumentsJson,

						isArchived: requestBody.isArchived,

						game_id: game.id,
					},
				});

			return {
				success: true,
			};
		},
	});