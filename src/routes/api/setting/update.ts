//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";

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