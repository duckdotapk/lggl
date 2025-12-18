//
// Imports
//

import { FritterContext, FritterMiddlewareFunction } from "@lorenstuff/fritter";

import { prismaClient } from "../instances/prismaClient.js";

import { getSettings, Settings } from "../libs/models/Setting.js";

//
// Middleware
//

export type MiddlewareFritterContext = FritterContext &
{
	settings: Settings;
};

export type CreateResult =
{
	execute: FritterMiddlewareFunction<MiddlewareFritterContext>;
};

export function create(): CreateResult
{
	return {
		execute: async (context, next) =>
		{
			context.settings = await getSettings(prismaClient);

			await next();
		},
	};
}