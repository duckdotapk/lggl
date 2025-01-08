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
						name: z.literal("groupMode"),
						value: SettingSchemaLib.GroupModeSchema,
					}),

				z.object(
					{
						name: z.literal("showFavoritesGroup"),
						value: SettingSchemaLib.ShowFavoritesGroupSchema,
					}),

				z.object(
					{
						name: z.literal("showVisibleGames"),
						value: SettingSchemaLib.ShowVisibleGamesSchema,
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