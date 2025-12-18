//
// Imports
//

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import { ApiError, createEndpointRoute } from "../../../libs/Api.js";
import { ProcessRequirementsSchema } from "../../../libs/System.js";

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
		const gamePlayAction = await prismaClient.gamePlayAction.findUnique(
		{
			where:
			{
				id: requestBody.id,
			},
		});

		if (gamePlayAction == null)
		{
			throw new ApiError(
			{
				code: "NOT_FOUND",
				message: "GamePlayAction not found.",
			});
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

		if (requestBody.updateData.additionalArguments !== undefined)
		{
			if (requestBody.updateData.additionalArguments !== null)
			{
				let additionalArgumentsJson;

				try
				{
					additionalArgumentsJson = JSON.parse(
						requestBody.updateData.additionalArguments,
					);
				}
				catch (error)
				{
					throw new ApiError(
					{
						code: "INVALID_REQUEST_BODY",
						message: "additionalArguments is not valid JSON.",
					});
				}

				const additionalArgumentsParseResult = z.array(z.string()).safeParse(
					additionalArgumentsJson,
				);

				if (!additionalArgumentsParseResult.success)
				{
					throw new ApiError(
					{
						code: "INVALID_REQUEST_BODY",
						message: "additionalArguments is not the correct shape.",
					});
				}
			}

			gamePlayActionUpdateData.additionalArguments =
				requestBody.updateData.additionalArguments;
		}

		if (requestBody.updateData.processRequirements !== undefined)
		{
			if (requestBody.updateData.processRequirements !== null)
			{
				let processRequirementsJson;
	
				try
				{
					processRequirementsJson = JSON.parse(
						requestBody.updateData.processRequirements,
					);
				}
				catch (error)
				{
					throw new ApiError(
					{
						code: "INVALID_REQUEST_BODY",
						message: "processRequirements is not valid JSON.",
					});
				}

				const processRequirementsParseResult = ProcessRequirementsSchema.safeParse(
					processRequirementsJson,
				);

				if (!processRequirementsParseResult.success)
				{
					throw new ApiError(
					{
						code: "INVALID_REQUEST_BODY",
						message: "processRequirements is not the correct shape.",
					});
				}

				gamePlayActionUpdateData.processRequirements = JSON.stringify(JSON.parse(
					requestBody.updateData.processRequirements,
				));
			}
			else
			{
				gamePlayActionUpdateData.processRequirements = null;
			}
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