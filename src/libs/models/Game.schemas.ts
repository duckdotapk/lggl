//
// Imports
//

import
{
	GameAchievementSupport,
	GameCompletionStatus,
	GameControllerSupport,
	GameLogoImageAlignment,
	GameLogoImageJustification,
	GameModSupport,
	GameProgressionType,
	GameSteamDeckCompatibility,
	GameVirtualRealitySupport,
	Prisma,
} from "@prisma/client";

import z from "zod";

//
// Locals
//

type Game = Pick<Prisma.GameGetPayload<null>, keyof Prisma.GameFieldRefs>;

type GameField<T extends keyof Game> = z.ZodType<Game[T], z.ZodType, any>;

//
// Schemas
//

export const GameProgressionTypeSchema =  z.enum(
[
	"NONE" satisfies GameProgressionType,
	"NON_CAMPAIGN" satisfies GameProgressionType,
	"CAMPAIGN" satisfies GameProgressionType,
]) satisfies GameField<"progressionType">;

export const GameLogoImageAlignmentSchema =  z.enum(
[
	"START" satisfies GameLogoImageAlignment,
	"CENTER" satisfies GameLogoImageAlignment,
	"END" satisfies GameLogoImageAlignment,
]) satisfies GameField<"logoImageAlignment">;

export const GameLogoImageJustificationSchema =  z.enum(
[
	"START" satisfies GameLogoImageJustification,
	"CENTER" satisfies GameLogoImageJustification,
]) satisfies GameField<"logoImageJustification">;

export const GameCompletionStatusSchema =  z.enum(
[
	"TODO" satisfies GameCompletionStatus,
	"IN_PROGRESS" satisfies GameCompletionStatus,
	"COMPLETE" satisfies GameCompletionStatus,
	"ONE_HUNDRED_PERCENT" satisfies GameCompletionStatus,
]) satisfies GameField<"completionStatus">;

export const GameAchievementSupportSchema =  z.enum(
[
	"NONE" satisfies GameAchievementSupport,
	"INGAME" satisfies GameAchievementSupport,
	"LAUNCHER" satisfies GameAchievementSupport,
]) satisfies GameField<"achievementSupport">;

export const GameControllerSupportSchema =  z.enum(
[
	"NONE" satisfies GameControllerSupport,
	"SUPPORTED" satisfies GameControllerSupport,
	"REQUIRED" satisfies GameControllerSupport,
]) satisfies GameField<"controllerSupport">;

export const GameModSupportSchema =  z.enum(
[
	"NONE" satisfies GameModSupport,
	"UNOFFICIAL" satisfies GameModSupport,
	"OFFICIAL" satisfies GameModSupport,
]) satisfies GameField<"modSupport">;

export const GameVirtualRealitySupportSchema =  z.enum(
[
	"NONE" satisfies GameVirtualRealitySupport,
	"SUPPORTED" satisfies GameVirtualRealitySupport,
	"REQUIRED" satisfies GameVirtualRealitySupport,
]) satisfies GameField<"modSupport">;

export const GameSteamDeckCompatibilitySchema =  z.enum(
[
	"UNKNOWN" satisfies GameSteamDeckCompatibility,
	"UNSUPPORTED" satisfies GameSteamDeckCompatibility,
	"PLAYABLE" satisfies GameSteamDeckCompatibility,
	"VERIFIED" satisfies GameSteamDeckCompatibility,
]) satisfies GameField<"modSupport">;