//
// Imports
//

import path from "node:path";

import { Prisma } from "@prisma/client";

import { LGGL_DATA_DIRECTORY } from "../../env/LGGL_DATA_DIRECTORY.js";

import { z } from "zod";

//
// Schemas
//

export const ProgressionTypeSchema = z.enum(
	[
		"NONE",
		"NON_CAMPAIGN",
		"CAMPAIGN",
	]);

export const CompletionStatusSchema = z.enum(
	[
		"TODO",
		"IN_PROGRESS",
		"COMPLETE",
		"ONE_HUNDRED_PERCENT",
	]);

export const AchievementSupportSchema = z.enum(
	[
		"NONE",
		"INGAME",
		"LAUNCHER",
	]);

export const ControllerSupportSchema = z.enum(
	[
		"NONE",
		"SUPPORTED",
		"REQUIRED",
	]);

export const ModSupportSchema = z.enum(
	[
		"NONE",
		"UNOFFICIAL",
		"OFFICIAL",
	]);

export const VirtualRealitySupportSchema = z.enum(
	[
		"NONE",
		"SUPPORTED",
		"REQUIRED",
	]);

//
// Types
//

export type ProgressionType = z.infer<typeof ProgressionTypeSchema>;

export type CompletionStatus = z.infer<typeof CompletionStatusSchema>;

export type AchievementSupport = z.infer<typeof AchievementSupportSchema>;

export type ControllerSupport = z.infer<typeof ControllerSupportSchema>;

export type ModSupport = z.infer<typeof ModSupportSchema>;

export type VirtualRealitySupport = z.infer<typeof VirtualRealitySupportSchema>;

//
// Constants
//

/** @deprecated */
export const PROGRESSION_TYPE: Record<ProgressionType, string> =
{
	NONE: "NONE",
	NON_CAMPAIGN: "NON_CAMPAIGN",
	CAMPAIGN: "CAMPAIGN",
};

/** @deprecated */
export const COMPLETION_STATUS: Record<CompletionStatus, string> =
{
	TODO: "TODO",
	IN_PROGRESS: "IN_PROGRESS",
	COMPLETE: "COMPLETE",
	ONE_HUNDRED_PERCENT: "ONE_HUNDRED_PERCENT",
};

/** @deprecated */
export const ACHIEVEMENT_SUPPORT: Record<AchievementSupport, string> =
{
	NONE: "NONE",
	INGAME: "INGAME",
	LAUNCHER: "LAUNCHER",
};

/** @deprecated */
export const CONTROLLER_SUPPORT: Record<ControllerSupport, string> =
{
	NONE: "NONE",
	SUPPORTED: "SUPPORTED",
	REQUIRED: "REQUIRED",
};

/** @deprecated */
export const MOD_SUPPORT: Record<ModSupport, string> =
{
	NONE: "NONE",
	UNOFFICIAL: "UNOFFICIAL",
	OFFICIAL: "OFFICIAL",
};

/** @deprecated */
export const VIRTUAL_REALITY_SUPPORT: Record<VirtualRealitySupport, string> =
{
	NONE: "NONE",
	SUPPORTED: "SUPPORTED",
	REQUIRED: "REQUIRED",
};

//
// Utility Functions
//

export function getImageUrls(game: Prisma.GameGetPayload<null>)
{
	return {
		banner: "/data/images/games/" + game.id + "/banner.jpg",
		cover: "/data/images/games/" + game.id + "/cover.jpg",
		icon: "/data/images/games/" + game.id + "/icon.png",
		logo: "/data/images/games/" + game.id + "/logo.png",
	};
}

export function getImagePaths(game: Prisma.GameGetPayload<null>)
{
	return {
		banner: path.join(LGGL_DATA_DIRECTORY, "images", "games", game.id.toString(), "banner.jpg"),
		cover: path.join(LGGL_DATA_DIRECTORY, "images", "games", game.id.toString(), "cover.jpg"),
		icon: path.join(LGGL_DATA_DIRECTORY, "images", "games", game.id.toString(), "icon.png"),
		logo: path.join(LGGL_DATA_DIRECTORY, "images", "games", game.id.toString(), "logo.png"),
	}
}