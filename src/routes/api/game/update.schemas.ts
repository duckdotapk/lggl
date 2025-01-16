//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";
import { z } from "zod";

import * as GameSchemaLib from "../../../libs/schemas/Game.js";

//
// Schemas
//

export const RequestBodySchema = z.object(
	{
		id: z.number().int().min(1),
		
		updateData: z.object(
			{
				name: z.string().trim(),
				sortName: z.string().trim(),
				releaseDate: z.string().date().nullable(),
				description: z.string().trim().nullable(),
				notes: z.string().trim().nullable(),
				progressionType: GameSchemaLib.ProgressionTypeSchema.nullable(),

				hasBannerImage: z.boolean(),
				hasCoverImage: z.boolean(),
				hasIconImage: z.boolean(),
				hasLogoImage: z.boolean(),
				logoImageAlignment: GameSchemaLib.LogoImageAlignmentSchema.nullable(),
				logoImageJustification: GameSchemaLib.LogoImageJustificationSchema.nullable(),

				isEarlyAccess: z.boolean(),
				isFavorite: z.boolean(),
				isHidden: z.boolean(),
				isInstalled: z.boolean(),
				isNsfw: z.boolean(),
				isShelved: z.boolean(),
				isUnknownEngine: z.boolean(),
				isUnreleased: z.boolean(),

				completionStatus: GameSchemaLib.CompletionStatusSchema.nullable(),
				firstPlayedDate: z.string().nullable(),
				firstPlayedDateApproximated: z.boolean(),
				firstCompletedDate: z.string().nullable(),
				firstCompletedDateApproximated: z.boolean(),
				lastPlayedDate: z.string().nullable(),
				playCount: z.number(),
				playTimeTotalSeconds: z.number(),

				achievementSupport: GameSchemaLib.AchievementSupportSchema.nullable(),
				controllerSupport: GameSchemaLib.ControllerSupportSchema.nullable(),
				modSupport: GameSchemaLib.ModSupportSchema.nullable(),
				virtualRealitySupport: GameSchemaLib.VirtualRealitySupportSchema.nullable(),

				steamAppId: z.number().nullable(),
				steamAppName: z.string().nullable(),
			}).partial(),
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

export const path = "/api/games/update";

//
// Utility Functions
//

export function updateGame(id: number, updateData: RequestBody["updateData"])
{
	return FritterApiUtilities.request(method, path,
		{
			requestBodySchema: RequestBodySchema,
			responseBodySchema: ResponseBodySchema,
			requestBody:
			{
				id,
				updateData,
			},
		});
}