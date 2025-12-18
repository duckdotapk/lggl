//
// Imports
//

import { z } from "zod";

import
{
	GameProgressionTypeSchema,
	GameLogoImageAlignmentSchema,
	GameLogoImageJustificationSchema,
	GameCompletionStatusSchema,
	GameAchievementSupportSchema,
	GameControllerSupportSchema,
	GameModSupportSchema,
	GameVirtualRealitySupportSchema,
	GameSteamDeckCompatibilitySchema,
} from "../../../libs/models/Game.schemas.js";

import { ErrorResponseBodySchema, SuccessResponseBodySchema } from "../../../libs/Api.client.js";

//
// Schema
//

export const method = "POST";

export const path = "/api/games/update";

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
		progressionType: GameProgressionTypeSchema.nullable(),

		hasBannerImage: z.boolean(),
		hasCoverImage: z.boolean(),
		hasIconImage: z.boolean(),
		hasLogoImage: z.boolean(),
		logoImageAlignment: GameLogoImageAlignmentSchema.nullable(),
		logoImageJustification: GameLogoImageJustificationSchema.nullable(),

		isEarlyAccess: z.boolean(),
		isFamilyShared: z.boolean(),
		isFavorite: z.boolean(),
		isHidden: z.boolean(),
		isNsfw: z.boolean(),
		isShelved: z.boolean(),
		isUnknownEngine: z.boolean(),
		isUnreleased: z.boolean(),

		purchaseDate: z.string().nullable(),
		completionStatus: GameCompletionStatusSchema.nullable(),
		firstPlayedDate: z.string().nullable(),
		firstPlayedDateApproximated: z.boolean(),
		firstCompletedDate: z.string().nullable(),
		firstCompletedDateApproximated: z.boolean(),
		lastPlayedDate: z.string().nullable(),
		playCount: z.number(),
		playTimeTotalSeconds: z.number(),

		achievementSupport: GameAchievementSupportSchema.nullable(),
		controllerSupport: GameControllerSupportSchema.nullable(),
		modSupport: GameModSupportSchema.nullable(),
		virtualRealitySupport: GameVirtualRealitySupportSchema.nullable(),

		steamAppId: z.number().nullable(),
		steamAppName: z.string().nullable(),
		steamDeckCompatibility: GameSteamDeckCompatibilitySchema.nullable(),
	}).partial(),
});

export const ResponseBodySchema = z.union(
[
	SuccessResponseBodySchema,
	ErrorResponseBodySchema,
]);