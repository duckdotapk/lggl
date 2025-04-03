//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";
import { GameAchievementSupport, GameCompletionStatus, GameControllerSupport, GameLogoImageAlignment, GameLogoImageJustification, GameModSupport, GameProgressionType, GameSteamDeckCompatibility, GameVirtualRealitySupport } from "@prisma/client";
import { z } from "zod";


//
// Schemas
//

export const RequestBodySchema = z.object(
	{
		name: z.string().trim(),
		sortName: z.string().trim(),
		releaseDate: z.string().date().nullable(),
		description: z.string().trim().nullable(),
		notes: z.string().trim().nullable(),
		progressionType: z.custom<GameProgressionType>().nullable(),

		hasBannerImage: z.boolean(),
		hasCoverImage: z.boolean(),
		hasIconImage: z.boolean(),
		hasLogoImage: z.boolean(),
		logoImageAlignment: z.custom<GameLogoImageAlignment>().nullable(),
		logoImageJustification: z.custom<GameLogoImageJustification>().nullable(),

		isEarlyAccess: z.boolean(),
		isFamilyShared: z.boolean(),
		isFavorite: z.boolean(),
		isHidden: z.boolean(),
		isNsfw: z.boolean(),
		isShelved: z.boolean(),
		isUnknownEngine: z.boolean(),
		isUnreleased: z.boolean(),

		purchaseDate: z.string().nullable(),
		completionStatus: z.custom<GameCompletionStatus>().nullable(),
		firstPlayedDate: z.string().nullable(),
		firstPlayedDateApproximated: z.boolean(),
		firstCompletedDate: z.string().nullable(),
		firstCompletedDateApproximated: z.boolean(),
		lastPlayedDate: z.string().nullable(),
		playCount: z.number(),
		playTimeTotalSeconds: z.number(),

		achievementSupport: z.custom<GameAchievementSupport>().nullable(),
		controllerSupport: z.custom<GameControllerSupport>().nullable(),
		modSupport: z.custom<GameModSupport>().nullable(),
		virtualRealitySupport: z.custom<GameVirtualRealitySupport>().nullable(),

		steamAppId: z.number().nullable(),
		steamAppName: z.string().nullable(),
		steamDeckCompatibility: z.custom<GameSteamDeckCompatibility>().nullable(),
	});

export const ResponseBodySchema = z.union(
	[
		FritterApiUtilities.SuccessResponseBodySchema.extend(
			{
				game: z.object(
					{
						id: z.number(),
					}),
			}),

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

export const path = "/api/games/create";

//
// Utility Functions
//

export function createGame(requestBody: RequestBody)
{
	return FritterApiUtilities.request(method, path,
		{
			requestBodySchema: RequestBodySchema,
			responseBodySchema: ResponseBodySchema,
			requestBody,
		});
}