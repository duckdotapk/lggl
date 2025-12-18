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
		const company = await prismaClient.company.findUnique(
			{
				where:
				{
					id: requestBody.id,
				},
			});

		if (company == null)
		{
			throw new ApiError(
			{
				code: "NOT_FOUND",
				message: "Company not found.",
			});
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

		await prismaClient.company.update(
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