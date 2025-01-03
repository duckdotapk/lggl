//
// Imports
//

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