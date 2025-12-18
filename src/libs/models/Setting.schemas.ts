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

export const GameGroupModeSchema = z.enum(
[
	"completionStatus",
	"createdDate",
	"developer",
	"engine",
	"firstCompletedDate",
	"firstPlayedDate",
	"name",
	"lastPlayedDate",
	"playTime",
	"publisher",
	"purchaseDate",
	"series",
	"steamDeckCompatibility",
]);
export const ShowFavoritesGroupSchema = BooleanSchema;
export const ShowRegularGamesSchema = BooleanSchema;
export const ShowHiddenGamesSchema = BooleanSchema;
export const ShowNsfwGamesSchema = BooleanSchema;

export const CompanyGroupModeSchema = z.enum(
[
	"name",
	"numberOfGamesDeveloped",
	"numberOfGamesPublished",
]);

export const EngineGroupModeSchema = z.enum(
[
	"name",
	"numberOfGames",
]);

export const PlatformGroupModeSchema = z.enum(
[
	"name",
	"numberOfGames",
]);

export const SeriesGroupModeSchema = z.enum(
[
	"name",
	"numberOfGames",
]);

export const InitialProcessCheckDelaySchema = z.number();
export const ProcessCheckIntervalSchema = z.number();
export const MaxProcessCheckAttemptsSchema = z.number();

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

export type InitialProcessCheckDelay = z.infer<typeof InitialProcessCheckDelaySchema>;
export type ProcessCheckInterval = z.infer<typeof ProcessCheckIntervalSchema>;
export type MaxProcessCheckAttempts = z.infer<typeof MaxProcessCheckAttemptsSchema>;