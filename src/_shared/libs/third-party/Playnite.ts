//
// Imports
//

import { DateTime } from "luxon";
import { z } from "zod";

//
// Schemas
//

export const PlayniteGameSchema = z.object(
	{
		BackgroundImage: z.string().nullable(),
		Description: z.string().nullable(),
		Notes: z.string().nullable(),
		GenreIds: z.array(z.string()),
		EnableSystemHdr: z.boolean(),
		Hidden: z.boolean(),
		Favorite: z.boolean(),
		Icon: z.string(),
		CoverImage: z.string().nullable(),
		InstallDirectory: z.string().nullable(),
		LastActivity: z.string().transform((value) => DateTime.fromISO(value)).nullable(),
		SortingName: z.string(),
		GameId: z.string(),
		PluginId: z.string(),
		IncludeLibraryPluginAction: z.boolean(),
		GameActions: z.array(z.object(
			{
				Type: z.number(),
				Arguments: z.string().nullable(),
				AdditionalArguments: z.string().nullable(),
				OverrideDefaultArgs: z.boolean(),
				Path: z.string(),
				WorkingDir: z.string().nullable(),
				Name: z.string(),
				IsPlayAction: z.boolean(),
				EmulatorId: z.string(),
				EmulatorProfileId: z.unknown().nullable(),
				TrackingMode: z.number(),
				TrackingPath: z.string().nullable(),
				Script: z.unknown().nullable(),
				InitialTrackingDelay: z.number(),
				TrackingFrequency: z.number(),
			})),
		PlatformIds: z.array(z.string()),
		PublisherIds: z.array(z.string()),
		DeveloperIds: z.array(z.string()),
		ReleaseDate: z.object(
			{
				ReleaseDate: z.string().transform((value) => DateTime.fromFormat(value, "yyyy-M-d").toObject()),
			}).nullable(),
		CategoryIds: z.array(z.string()).nullable(),
		TagIds: z.array(z.string()),
		FeatureIds: z.array(z.string()),
		Links: z.array(z.object(
			{
				Name: z.string(),
				Url: z.string().url(),
			})).nullable(),
		Roms: z.array(z.unknown()).nullable(),
		IsInstalling: z.boolean(),
		IsUninstalling: z.boolean(),
		IsLaunching: z.boolean(),
		IsRunning: z.boolean(),
		IsInstalled: z.boolean(),
		OverrideInstallState: z.boolean(),
		Playtime: z.number(),
		Added: z.string().transform((value) => DateTime.fromISO(value)),
		Modified: z.string().transform((value) => DateTime.fromISO(value)),
		PlayCount: z.number(),
		InstallSize: z.number().nullable(),
		LastSizeScanDate: z.string().transform((value) => DateTime.fromISO(value)).nullable(),
		SeriesIds: z.array(z.string()),
		Version: z.string().nullable(),
		AgeRatingIds: z.array(z.string()),
		RegionIds: z.array(z.string()),
		SourceId: z.string(),
		CompletionStatusId: z.string(),
		UserScore: z.number().nullable(),
		CriticScore: z.number().nullable(),
		CommunityScore: z.number().nullable(),
		PreScript: z.unknown().nullable(),
		PostScript: z.unknown().nullable(),
		GameStartedScript: z.unknown().nullable(),
		UseGlobalPostScript: z.boolean(),
		UseGlobalPreScript: z.boolean(),
		UseGlobalGameStartedScript: z.boolean(),
		Manual: z.unknown().nullable(),
		Genres: z.array(z.object(
			{
				Id: z.string(),
				Name: z.string(),
			})),
		Developers: z.array(z.object(
			{
				Id: z.string(),
				Name: z.string(),
			})),
		Publishers: z.array(z.object(
			{
				Id: z.string(),
				Name: z.string(),
			})),
		Tags: z.array(z.object(
			{
				Id: z.string(),
				Name: z.string(),
			})),
		Features: z.array(z.object(
			{
				Id: z.string(),
				Name: z.string(),
			})),
		Categories: z.array(z.object(
			{
				Id: z.string(),
				Name: z.string(),
			})).nullable(),
		Platforms: z.array(z.object(
			{
				SpecificationId: z.string().nullable(),
				Icon: z.string().nullable(),
				Cover: z.string().nullable(),
				Background: z.string().nullable(),
				Id: z.string(),
				Name: z.string(),
			})),
		Series: z.array(z.object(
			{
				Id: z.string(),
				Name: z.string(),
			})),
		AgeRatings: z.array(z.object(
			{
				Id: z.string(),
				Name: z.string(),
			})),
		Regions: z.array(z.object(
			{
				SpecificationId: z.string().nullable(),
				Id: z.string(),
				Name: z.string(),
			})),
		Source: z.object(
			{
				Id: z.string(),
				Name: z.string(),
			}),
		CompletionStatus: z.object(
			{
				Id: z.string(),
				Name: z.string(),
			}),
		ReleaseYear: z.number().nullable(),
		RecentActivity: z.string().transform((value) => DateTime.fromISO(value)),
		UserScoreRating: z.number(),
		CommunityScoreRating: z.number(),
		CriticScoreRating: z.number(),
		UserScoreGroup: z.number(),
		CommunityScoreGroup: z.number(),
		CriticScoreGroup: z.number(),
		LastActivitySegment: z.number(),
		RecentActivitySegment: z.number(),
		AddedSegment: z.number(),
		ModifiedSegment: z.number(),
		PlaytimeCategory: z.number(),
		InstallSizeGroup: z.number(),
		IsCustomGame: z.boolean(),
		InstallationStatus: z.number(),
		Id: z.string(),
		Name: z.string(),
	});

//
// Types
//

export type PlayniteGame = z.infer<typeof PlayniteGameSchema>;