//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";
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
						name: z.literal("gameGroupMode"),
						value: SettingSchemaLib.GameGroupModeSchema,
					}),

				z.object(
					{
						name: z.literal("showFavoritesGroup"),
						value: SettingSchemaLib.ShowFavoritesGroupSchema,
					}),

				z.object(
					{
						name: z.literal("showRegularGames"),
						value: SettingSchemaLib.ShowRegularGamesSchema,
					}),

				z.object(
					{
						name: z.literal("showHiddenGames"),
						value: SettingSchemaLib.ShowHiddenGamesSchema,
					}),

				z.object(
					{
						name: z.literal("showNsfwGames"),
						value: SettingSchemaLib.ShowNsfwGamesSchema,
					}),

				z.object(
					{
						name: z.literal("companyGroupMode"),
						value: SettingSchemaLib.CompanyGroupModeSchema,
					}),

				z.object(
					{
						name: z.literal("engineGroupMode"),
						value: SettingSchemaLib.EngineGroupModeSchema,
					}),

				z.object(
					{
						name: z.literal("platformGroupMode"),
						value: SettingSchemaLib.PlatformGroupModeSchema,
					}),

				z.object(
					{
						name: z.literal("seriesGroupMode"),
						value: SettingSchemaLib.SeriesGroupModeSchema,
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