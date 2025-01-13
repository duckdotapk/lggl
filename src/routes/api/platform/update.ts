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
			const platform = await prismaClient.platform.findUnique(
				{
					where:
					{
						id: requestBody.id,
					},
				});

			if (platform == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Platform not found." });
			}

			const platformUpdateData: Prisma.PlatformUpdateArgs["data"] = {};

			if (requestBody.updateData.iconName !== undefined)
			{
				platformUpdateData.iconName = requestBody.updateData.iconName;
			}

			if (requestBody.updateData.name !== undefined)
			{
				platformUpdateData.name = requestBody.updateData.name;
			}

			if (Object.keys(platformUpdateData).length == 0)
			{
				return {
					success: true,
				};
			}

			await prismaClient.platform.update(
				{
					where:
					{
						id: platform.id,
					},
					data: platformUpdateData,
				});

			return {
				success: true,
			};
		},
	});