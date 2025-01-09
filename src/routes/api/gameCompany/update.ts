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
			const gameCompany = await prismaClient.gameCompany.findUnique(
				{
					where:
					{
						id: requestBody.id,
					},
				});

			if (gameCompany == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Game company not found." });
			}

			const gameCompanyUpdateData: Prisma.GameCompanyUpdateArgs["data"] = {};

			if (requestBody.updateData.notes !== undefined)
			{
				gameCompanyUpdateData.notes = requestBody.updateData.notes;
			}

			if (requestBody.updateData.type !== undefined)
			{
				gameCompanyUpdateData.type = requestBody.updateData.type;
			}

			if (requestBody.updateData.company_id !== undefined)
			{
				gameCompanyUpdateData.company_id = requestBody.updateData.company_id;
			}

			if (Object.keys(gameCompanyUpdateData).length == 0)
			{
				return {
					success: true,
				};
			}

			await prismaClient.gameCompany.update(
				{
					where:
					{
						id: gameCompany.id,
					},
					data: gameCompanyUpdateData,
				});

			return {
				success: true,
			};
		},
	});