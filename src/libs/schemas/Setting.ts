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

export const GameGroupModeSchema = z.enum([ "completionStatus", "developer", "engine", "name", "lastPlayedDate", "playTime", "publisher", "series" ]);
export const ShowFavoritesGroupSchema = BooleanSchema;
export const ShowRegularGamesSchema = BooleanSchema;
export const ShowHiddenGamesSchema = BooleanSchema;
export const ShowNsfwGamesSchema = BooleanSchema;

export const CompanyGroupModeSchema = z.enum([ "name", "numberOfGamesDeveloped", "numberOfGamesPublished" ]);

export const EngineGroupModeSchema = z.enum([ "name", "numberOfGames" ]);

export const PlatformGroupModeSchema = z.enum([ "name", "numberOfGames" ]);

export const SeriesGroupModeSchema = z.enum([ "name", "numberOfGames" ]);

//
// Types
//

export type GameGroupMode = z.infer<typeof GameGroupModeSchema>;
export type ShowFavoritesGroup = z.infer<typeof ShowFavoritesGroupSchema>;
export type ShowRegularGames = z.infer<typeof ShowRegularGamesSchema>;
export type ShowHiddenGames = z.infer<typeof ShowHiddenGamesSchema>;
export type ShowNsfwGames = z.infer<typeof ShowNsfwGamesSchema>;

export type CompanyGroupMode = z.infer<typeof CompanyGroupModeSchema>;

export type EngineGroupMode = z.infer<typeof EngineGroupModeSchema>;

export type PlatformGroupMode = z.infer<typeof PlatformGroupModeSchema>;

export type SeriesGroupMode = z.infer<typeof SeriesGroupModeSchema>;