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
		const gamePlatform = await prismaClient.gamePlatform.findUnique(
		{
			where:
			{
				id: requestBody.id,
			},
		});

		if (gamePlatform == null)
		{
			throw new ApiError(
			{
				code: "NOT_FOUND",
				message: "GamePlatform not found.",
			});
		}

		const gamePlatformUpdateData: Prisma.GamePlatformUpdateArgs["data"] = {};

		if (requestBody.updateData.notes !== undefined)
		{
			gamePlatformUpdateData.notes = requestBody.updateData.notes;
		}

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
				throw new ApiError(
				{
					code: "NOT_FOUND",
					message: "Platform not found.",
				});
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