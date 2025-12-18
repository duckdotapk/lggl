//
// Imports
//

import { SettingName } from "@prisma/client";
import { z } from "zod";

import
{
	CompanyGroupModeSchema,
	EngineGroupModeSchema,
	GameGroupModeSchema,
	InitialProcessCheckDelaySchema,
	MaxProcessCheckAttemptsSchema,
	PlatformGroupModeSchema,
	ProcessCheckIntervalSchema,
	SeriesGroupModeSchema,
	ShowFavoritesGroupSchema,
	ShowHiddenGamesSchema,
	ShowNsfwGamesSchema,
	ShowRegularGamesSchema,
} from "../../../libs/models/Setting.schemas.js";

import { SuccessResponseBodySchema, ErrorResponseBodySchema } from "../../../libs/Api.client.js";

//
// Schema
//

export const method = "POST";

export const path = "/api/settings/update";

export const RequestBodySchema = z.object(
{
	settingUpdates: z.array(z.union(
	[
		z.object(
		{
			name: z.literal("GAME_GROUP_MODE" satisfies SettingName),
			value: GameGroupModeSchema,
		}),
		z.object(
		{
			name: z.literal("SHOW_FAVORITES_GROUP" satisfies SettingName),
			value: ShowFavoritesGroupSchema,
		}),
		z.object(
		{
			name: z.literal("SHOW_REGULAR_GAMES" satisfies SettingName),
			value: ShowRegularGamesSchema,
		}),
		z.object(
		{
			name: z.literal("SHOW_HIDDEN_GAMES" satisfies SettingName),
			value: ShowHiddenGamesSchema,
		}),
		z.object(
		{
			name: z.literal("SHOW_NSFW_GAMES" satisfies SettingName),
			value: ShowNsfwGamesSchema,
		}),
		z.object(
		{
			name: z.literal("COMPANY_GROUP_MODE" satisfies SettingName),
			value: CompanyGroupModeSchema,
		}),
		z.object(
		{
			name: z.literal("ENGINE_GROUP_MODE" satisfies SettingName),
			value: EngineGroupModeSchema,
		}),
		z.object(
		{
			name: z.literal("PLATFORM_GROUP_MODE" satisfies SettingName),
			value: PlatformGroupModeSchema,
		}),
		z.object(
		{
			name: z.literal("SERIES_GROUP_MODE" satisfies SettingName),
			value: SeriesGroupModeSchema,
		}),
		z.object(
		{
			name: z.literal("INITIAL_PROCESS_CHECK_DELAY" satisfies SettingName),
			value: InitialProcessCheckDelaySchema,
		}),
		z.object(
		{
			name: z.literal("PROCESS_CHECK_INTERVAL" satisfies SettingName),
			value: ProcessCheckIntervalSchema,
		}),
		z.object(
		{
			name: z.literal("MAX_PROCESS_CHECK_ATTEMPTS" satisfies SettingName),
			value: MaxProcessCheckAttemptsSchema,
		}),
	])),
});

export const ResponseBodySchema = z.union(
[
	SuccessResponseBodySchema,
	ErrorResponseBodySchema,
]);