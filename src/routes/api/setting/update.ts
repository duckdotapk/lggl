//
// Imports
//

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import { createEndpointRoute } from "../../../libs/Api.js";

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
		for (const settingUpdate of requestBody.settingUpdates)
		{
			await prismaClient.setting.upsert(
			{
				where:
				{
					name: settingUpdate.name,
				},
				create:
				{
					name: settingUpdate.name,
					value: settingUpdate.value.toString(),
				},
				update:
				{
					value: settingUpdate.value.toString(),
				},
			});
		}

		return {
			success: true,
		};
	},
});