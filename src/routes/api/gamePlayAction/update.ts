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
			const gamePlayAction = await prismaClient.gamePlayAction.findUnique(
				{
					where:
					{
						id: requestBody.id,
					},
				});

			if (gamePlayAction == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "GamePlayAction not found." });
			}

			const gamePlayActionUpdateData: Prisma.GamePlayActionUpdateArgs["data"] = {};

			if (requestBody.updateData.name !== undefined)
			{
				gamePlayActionUpdateData.name = requestBody.updateData.name;
			}

			if (requestBody.updateData.type !== undefined)
			{
				gamePlayActionUpdateData.type = requestBody.updateData.type;
			}

			if (requestBody.updateData.path !== undefined)
			{
				gamePlayActionUpdateData.path = requestBody.updateData.path;
			}

			if (requestBody.updateData.workingDirectory !== undefined)
			{
				gamePlayActionUpdateData.workingDirectory = requestBody.updateData.workingDirectory;
			}

			if (requestBody.updateData.trackingPath !== undefined)
			{
				gamePlayActionUpdateData.trackingPath = requestBody.updateData.trackingPath;
			}

			if (requestBody.updateData.argumentsJson !== undefined)
			{
				gamePlayActionUpdateData.argumentsJson = requestBody.updateData.argumentsJson;
			}

			if (requestBody.updateData.isArchived !== undefined)
			{
				gamePlayActionUpdateData.isArchived = requestBody.updateData.isArchived;
			}

			if (Object.keys(gamePlayActionUpdateData).length == 0)
			{
				return {
					success: true,
				};
			}

			await prismaClient.gamePlayAction.update(
				{
					where:
					{
						id: gamePlayAction.id,
					},
					data: gamePlayActionUpdateData,
				});

			return {
				success: true,
			};
		},
	});