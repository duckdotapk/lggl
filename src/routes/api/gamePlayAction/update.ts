//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import * as SystemLib from "../../../libs/System.js";

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

			if (requestBody.updateData.additionalArguments !== undefined)
			{
				if (requestBody.updateData.additionalArguments !== null)
				{
					let additionalArgumentsJson;
	
					try
					{
						additionalArgumentsJson = JSON.parse(requestBody.updateData.additionalArguments);
					}
					catch (error)
					{
						throw new FritterApiUtilities.APIError({ code: "INVALID_REQUEST_BODY", message: "additionalArguments is not valid JSON." });
					}

					const additionalArgumentsParseResult = z.array(z.string()).safeParse(additionalArgumentsJson);

					if (!additionalArgumentsParseResult.success)
					{
						throw new FritterApiUtilities.APIError({ code: "INVALID_REQUEST_BODY", message: "additionalArguments is not the correct shape." });
					}
				}

				gamePlayActionUpdateData.additionalArguments = requestBody.updateData.additionalArguments;
			}

			if (requestBody.updateData.processRequirements !== undefined)
			{
				if (requestBody.updateData.processRequirements !== null)
				{
					let processRequirementsJson;
		
					try
					{
						processRequirementsJson = JSON.parse(requestBody.updateData.processRequirements);
					}
					catch (error)
					{
						throw new FritterApiUtilities.APIError({ code: "INVALID_REQUEST_BODY", message: "processRequirements is not valid JSON." });
					}
	
					const processRequirementsParseResult = SystemLib.ProcessRequirementsSchema.safeParse(processRequirementsJson);
	
					if (!processRequirementsParseResult.success)
					{
						throw new FritterApiUtilities.APIError({ code: "INVALID_REQUEST_BODY", message: "processRequirements is not the correct shape." });
					}

				}

				gamePlayActionUpdateData.processRequirements = requestBody.updateData.processRequirements;
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