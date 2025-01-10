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
			const company = await prismaClient.company.findUnique(
				{
					where:
					{
						id: requestBody.id,
					},
				});

			if (company == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "GameCompany not found." });
			}

			const companyUpdateData: Prisma.CompanyUpdateArgs["data"] = {};

			if (requestBody.updateData.name !== undefined)
			{
				companyUpdateData.name = requestBody.updateData.name;
			}

			if (Object.keys(companyUpdateData).length == 0)
			{
				return {
					success: true,
				};
			}

			await prismaClient.gameCompany.update(
				{
					where:
					{
						id: company.id,
					},
					data: companyUpdateData,
				});

			return {
				success: true,
			};
		},
	});