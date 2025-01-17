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
			const gameLink = await prismaClient.gameLink.findUnique(
				{
					where:
					{
						id: requestBody.id,
					},
				});

			if (gameLink == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "GameLink not found." });
			}

			const gameLinkUpdateData: Prisma.GameLinkUpdateArgs["data"] = {};

			if (requestBody.updateData.title != null)
			{
				gameLinkUpdateData.title = requestBody.updateData.title;
			}

			if (requestBody.updateData.url != null)
			{
				gameLinkUpdateData.url = requestBody.updateData.url;
			}

			if (Object.keys(gameLinkUpdateData).length == 0)
			{
				return {
					success: true,
				};
			}

			await prismaClient.gameLink.update(
				{
					where:
					{
						id: gameLink.id,
					},
					data: gameLinkUpdateData,
				});

			return {
				success: true,
			};
		},
	});