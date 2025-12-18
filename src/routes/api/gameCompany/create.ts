//
// Imports
//

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import { ApiError, createEndpointRoute } from "../../../libs/Api.js";

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

		const company = await prismaClient.company.findUnique(
		{
			where:
			{
				id: requestBody.company_id,
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

		await prismaClient.gameCompany.create(
		{
			data:
			{
				notes: requestBody.notes,
				type: requestBody.type,

				company_id: company.id,
				game_id: game.id,
			},
		});

		return {
			success: true,
		};
	},
});