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

export const GroupModeSchema = z.enum([ "name", "lastPlayed", "series", "playTime" ]);

export const ShowFavoritesGroupSchema = BooleanSchema;

export const ShowVisibleGamesSchema = BooleanSchema;

export const ShowHiddenGamesSchema = BooleanSchema;

export const ShowNsfwGamesSchema = BooleanSchema;

//
// Types
//

export type GroupMode = z.infer<typeof GroupModeSchema>;

export type ShowFavoritesGroup = z.infer<typeof ShowFavoritesGroupSchema>;

export type ShowVisibleGames = z.infer<typeof ShowVisibleGamesSchema>;

export type ShowHiddenGames = z.infer<typeof ShowHiddenGamesSchema>;

export type ShowNsfwGames = z.infer<typeof ShowNsfwGamesSchema>;