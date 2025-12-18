//
// Imports
//

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import { ApiError, createEndpointRoute } from "../../../libs/Api.js";

import * as schema from "./delete.schemas.js";

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
				code: "NOT FOUND",
				message: "GamePlayAction not found.",
			});
		}

		await prismaClient.$transaction(async (transactionClient) =>
		{
			await transactionClient.gamePlaySession.updateMany(
			{
				where:
				{
					gamePlayAction_id: requestBody.id,
				},
				data:
				{
					gamePlayAction_id: null,
				},
			});

			await transactionClient.gamePlayAction.delete(
			{
				where:
				{
					id: requestBody.id,
				},
			});
		});

		return {
			success: true,
		};
	},
});