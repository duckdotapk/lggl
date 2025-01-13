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
			const gamePlatform = await prismaClient.gamePlatform.findUnique(
				{
					where:
					{
						id: requestBody.id,
					},
				});

			if (gamePlatform == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "GamePlatform not found." });
			}

			const gamePlatformUpdateData: Prisma.GamePlatformUpdateArgs["data"] = {};

			if (requestBody.updateData.platform_id !== undefined)
			{
				const platform = await prismaClient.platform.findUnique(
					{
						where:
						{
							id: requestBody.updateData.platform_id,
						},
					});
				
				if (platform == null)
				{
					throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Platform not found." });
				}

				gamePlatformUpdateData.platform_id = platform.id;
			}

			if (Object.keys(gamePlatformUpdateData).length == 0)
			{
				return {
					success: true,
				};
			}

			await prismaClient.gamePlatform.update(
				{
					where:
					{
						id: gamePlatform.id,
					},
					data: gamePlatformUpdateData,
				});

			return {
				success: true,
			};
		},
	});