//
// Imports
//

import { z } from "zod";

//
// Schemas
//

const BooleanSchema = z.union(
	[
		z.boolean(),

		z.enum([ "true", "false" ]).transform(value => value == "true"),
	]);

export const GameGroupModeSchema = z.enum([ "name", "lastPlayed", "series", "playTime" ]);
export const ShowFavoritesGroupSchema = BooleanSchema;
export const ShowVisibleGamesSchema = BooleanSchema;
export const ShowHiddenGamesSchema = BooleanSchema;
export const ShowNsfwGamesSchema = BooleanSchema;

export const CompanyGroupModeSchema = z.enum([ "name" ]);

export const EngineGroupModeSchema = z.enum([ "name" ]);

export const PlatformGroupModeSchema = z.enum([ "name" ]);

//
// Types
//

export type GameGroupMode = z.infer<typeof GameGroupModeSchema>;
export type ShowFavoritesGroup = z.infer<typeof ShowFavoritesGroupSchema>;
export type ShowVisibleGames = z.infer<typeof ShowVisibleGamesSchema>;
export type ShowHiddenGames = z.infer<typeof ShowHiddenGamesSchema>;
export type ShowNsfwGames = z.infer<typeof ShowNsfwGamesSchema>;

export type CompanyGroupMode = z.infer<typeof CompanyGroupModeSchema>;

export type EngineGroupMode = z.infer<typeof EngineGroupModeSchema>;

export type PlatformGroupMode = z.infer<typeof PlatformGroupModeSchema>;