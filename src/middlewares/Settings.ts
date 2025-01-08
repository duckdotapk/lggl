//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../instances/prismaClient.js";

import * as SettingModelLib from "../libs/models/Setting.js";

//
// Middleware
//

export type MiddlewareFritterContext = Fritter.FritterContext &
{
	settings: SettingModelLib.Settings;
};

export type CreateResult =
{
	execute: Fritter.MiddlewareFunction<MiddlewareFritterContext>;
};

export function create(): CreateResult
{
	return {
		execute: async (context, next) =>
		{
			context.settings = await SettingModelLib.getSettings(prismaClient);

			await next();
		},
	};
}