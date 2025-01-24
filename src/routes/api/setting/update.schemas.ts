//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";
import { SettingName } from "@prisma/client";
import { z } from "zod";

import * as SettingSchemaLib from "../../../libs/schemas/Setting.js";

//
// Schemas
//

export const RequestBodySchema = z.object(
	{
		settingUpdates: z.array(z.union(
			[
				z.object(
					{
						name: z.literal("GAME_GROUP_MODE" satisfies SettingName),
						value: SettingSchemaLib.GameGroupModeSchema,
					}),

				z.object(
					{
						name: z.literal("SHOW_FAVORITES_GROUP" satisfies SettingName),
						value: SettingSchemaLib.ShowFavoritesGroupSchema,
					}),

				z.object(
					{
						name: z.literal("SHOW_REGULAR_GAMES" satisfies SettingName),
						value: SettingSchemaLib.ShowRegularGamesSchema,
					}),

				z.object(
					{
						name: z.literal("SHOW_HIDDEN_GAMES" satisfies SettingName),
						value: SettingSchemaLib.ShowHiddenGamesSchema,
					}),

				z.object(
					{
						name: z.literal("SHOW_NSFW_GAMES" satisfies SettingName),
						value: SettingSchemaLib.ShowNsfwGamesSchema,
					}),

				z.object(
					{
						name: z.literal("COMPANY_GROUP_MODE" satisfies SettingName),
						value: SettingSchemaLib.CompanyGroupModeSchema,
					}),

				z.object(
					{
						name: z.literal("ENGINE_GROUP_MODE" satisfies SettingName),
						value: SettingSchemaLib.EngineGroupModeSchema,
					}),

				z.object(
					{
						name: z.literal("PLATFORM_GROUP_MODE" satisfies SettingName),
						value: SettingSchemaLib.PlatformGroupModeSchema,
					}),

				z.object(
					{
						name: z.literal("SERIES_GROUP_MODE" satisfies SettingName),
						value: SettingSchemaLib.SeriesGroupModeSchema,
					}),

				z.object(
					{
						name: z.literal("INITIAL_PROCESS_CHECK_DELAY" satisfies SettingName),
						value: SettingSchemaLib.InitialProcessCheckDelaySchema,
					}),

				z.object(
					{
						name: z.literal("PROCESS_CHECK_INTERVAL" satisfies SettingName),
						value: SettingSchemaLib.ProcessCheckIntervalSchema,
					}),

				z.object(
					{
						name: z.literal("MAX_PROCESS_CHECK_ATTEMPTS" satisfies SettingName),
						value: SettingSchemaLib.MaxProcessCheckAttemptsSchema,
					}),
			])),
	});

export const ResponseBodySchema = z.union(
	[
		FritterApiUtilities.SuccessResponseBodySchema,

		FritterApiUtilities.ErrorResponseBodySchema,
	]);

//
// Types
//

export type RequestBody = z.infer<typeof RequestBodySchema>;
	
export type ResponseBody = z.infer<typeof ResponseBodySchema>;

//
// Constants
//

export const method = "POST";

export const path = "/api/settings/update";

//
// Utility Functions
//

export function updateSettings(requestBody: RequestBody)
{
	return FritterApiUtilities.request(method, path,
		{
			requestBodySchema: RequestBodySchema,
			responseBodySchema: ResponseBodySchema,
			requestBody,
		});
}