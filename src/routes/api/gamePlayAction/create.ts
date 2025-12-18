//
// Imports
//

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import { ApiError, createEndpointRoute } from "../../../libs/Api.js";
import { ProcessRequirementsSchema } from "../../../libs/System.js";

import * as schema from "./create.schemas.js";

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
		const game = await prismaClient.game.findUnique(
		{
			where:
			{
				id: requestBody.game_id,
			},
		});

		if (game == null)
		{
			throw new ApiError(
			{
				code: "NOT_FOUND",
				message: "Game not found.",
			});
		}

		const gamePlayActionCreateData: Prisma.GamePlayActionCreateArgs["data"] =
		{
			name: requestBody.name,
			type: requestBody.type,
			path: requestBody.path,
			workingDirectory: requestBody.workingDirectory,
			isArchived: requestBody.isArchived,

			game_id: game.id,
		};

		if (requestBody.additionalArguments != null)
		{
			let additionalArgumentsJson;

			try
			{
				additionalArgumentsJson = JSON.parse(requestBody.additionalArguments);
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

			gamePlayActionCreateData.additionalArguments = JSON.stringify(JSON.parse(
				requestBody.additionalArguments,
			));
		}

		if (requestBody.processRequirements != null)
		{
			let processRequirementsJson;

			try
			{
				processRequirementsJson = JSON.parse(requestBody.processRequirements);
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

			gamePlayActionCreateData.processRequirements = JSON.stringify(JSON.parse(
				requestBody.processRequirements,
			));
		}

		await prismaClient.gamePlayAction.create(
		{
			data: gamePlayActionCreateData,
		});

		return {
			success: true,
		};
	},
});