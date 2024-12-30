//
// Imports
//

import { z } from "zod";

import { configuration } from "../Configuration.js";

//
// Schemas
//

const IPlayerServiceGetOwnedGamesResponseSchema = z.object(
	{
		response: z.object(
			{
				game_count: z.number(),

				games: z.array(z.object(
					{
						appid: z.number(),
						name: z.string(),
						playtime_2weeks: z.number().nullish(),
						playtime_forever: z.number(),
						img_icon_url: z.string(),
						has_community_visible_stats: z.boolean(),
						playtime_windows_forever: z.number(),
						playtime_mac_forever: z.number(),
						playtime_linux_forever: z.number(),
						playtime_deck_forever: z.number(),
						rtime_last_played: z.number(),
						capsule_filename: z.string(),
						has_workshop: z.boolean(),
						has_market: z.boolean(),
						has_dlc: z.boolean(),
						content_descriptorids: z.array(z.number()).nullish(),
						playtime_disconnected: z.number(),
					})),
			}),
	});

const SystemRequirementsSchema = z.union(
	[
		z.object(
			{
				minimum: z.string(),
				recommended: z.string().nullish(),
			}),

		z.array(z.never()).length(0),
	]);

// Schema based on:
//	https://store.steampowered.com/api/appdetails?appids=220
//	https://store.steampowered.com/api/appdetails?appids=12200
//	https://wiki.teamfortress.com/wiki/User:RJackson/StorefrontAPI#Global_parameters
const AppDetailsResponseSchema = z.record(z.string(), z.union(
	[
		z.object(
			{
				success: z.literal(true),
				data: z.object(
					{
						type: z.enum([ "game", "dlc", "demo", "advertising", "mod", "video" ]),
						name: z.string(),
						steam_appid: z.number(),
						required_age: z.number(),
						is_free: z.boolean(),
						controller_support: z.enum([ "partial", "full" ]).optional(),
						dlc: z.array(z.number()).optional(),
						detailed_description: z.string(),
						about_the_game: z.string(),
						short_description: z.string(),
						fullgame: z.object(
							{
								appid: z.number().nullable(), // TODO: should this be null*ish*?
								name: z.string(),
							}).optional(),
						supported_languages: z.string(),
						header_image: z.string().url(),
						capsule_image: z.string().url(),
						capsule_imagev5: z.string().url(),
						website: z.string().url(),
						pc_requirements: SystemRequirementsSchema,
						mac_requirements: SystemRequirementsSchema,
						linux_requirements: SystemRequirementsSchema,
						legal_notice: z.string().optional(),
						developers: z.array(z.string()).optional(), // TODO: WTF? The TF2 Wiki page says optional but I fuckin doubt it?
						publishers: z.array(z.string()),
						demos: z.object(
							{
								appid: z.number(),
								description: z.string(),
							}).optional(),
						price_overview: z.object(
							{
								currency: z.string(),
								initial: z.number(),
								final: z.number(),
								discount_percent: z.number(),
								initial_formatted: z.string(),
								final_formatted: z.string(),
							}).optional(),
						packages: z.array(z.number()),
						package_groups: z.unknown(), // TODO: can't be bothered right now, I don't need this data
						platforms: z.object(
							{
								windows: z.boolean(),
								mac: z.boolean(),
								linux: z.boolean(),
							}),
						metacritic: z.object(
							{
								score: z.number(),
								url: z.string().url(),
							}).optional(),
						categories: z.array(z.object(
							{
								id: z.number(),
								description: z.string(),
							})).optional(),
						genres: z.array(z.object(
							{
								id: z.number(),
								description: z.string(), 
							})).optional(), 
						screenshots: z.array(z.object(
							{
								id: z.number(),
								path_thumbnail: z.string().url(),
								path_full: z.string().url(),
							})).optional(),
						movies: z.unknown(), // TODO
						achievements: z.unknown(), // TODO
						recommendations: z.object(
							{
								total: z.number(),
							}),
						release_date: z.object(
							{
								coming_soon: z.boolean(),
								date: z.string(),
							}),
						support_info: z.object(
							{
								url: z.string().url(),
								email: z.string(), // Note: Not validated to be an email because it can be a blank string
							}),
						background: z.string().url(),
						background_raw: z.string().url(),
						content_descriptors: z.object(
							{
								ids: z.array(z.number()),
								notes: z.string().nullable(),
							}),
						ratings: z.object(
							{
								esrb: z.object(
									{
										rating: z.string(),
										descriptors: z.string(),
									}).optional(),

								// TODO: other rating boards can have info here, too, but I only care about the ESRB right now
							}),
				}),
			}),

		z.object(
			{
				success: z.literal(false),
			}),
	]));

//
// Constants
//

export const CATEGORY_ID =
{
	SINGLEPLAYER: 2,
	CAPTIONS_AVAILABLE: 13,
	INCLUDES_LEVEL_EDITOR: 17,
	PARTIAL_CONTROLLER_SUPPORT: 18,
	STEAM_ACHIEVEMENTS: 22,
	STEAM_CLOUD: 23,
	FULL_CONTROLLER_SUPPORT: 28,
	STEAM_WORKSHOP: 30,
	VR_SUPPORT: 31,
	TRACKED_CONTROLLER_SUPPORT: 52,
	VR_SUPPORTED: 53,
	VR_ONLY: 54,
	FAMILY_SHARING: 62,
};

export const GENRE_ID =
{
	ACTION: 1,
	ADVENTURE: 25,
};

//
// Utility Functions
//

export async function fetchImageUrls(appId: string)
{
	const appDetails = await fetchOwnedApp(appId);

	// TODO: I'm not sure if this is the most "correct" names for these images
	return {
		icon: appDetails != null
			? ("https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/" + appId + "/" + appDetails.img_icon_url + ".jpg")
			: null,
		libraryBackground: "https://cdn.cloudflare.steamstatic.com/steam/apps/" + appId + "/library_hero.jpg",
		libraryCapsule: "https://cdn.cloudflare.steamstatic.com/steam/apps/" + appId + "/library_600x900_2x.jpg",
		libraryLogo: "https://cdn.cloudflare.steamstatic.com/steam/apps/" + appId + "/logo.png",
	};
}

export async function fetchOwnedApp(appId: string)
{
	const json =
	{
		steamid: configuration.steamUserId,
		include_appinfo: true,
		include_extended_appinfo: true,
		include_played_free_games: true,
		appids_filter: [ appId ],
	};

	const searchParameters = new URLSearchParams();

	searchParameters.set("key", configuration.steamApiKey);
	
	searchParameters.set("input_json", JSON.stringify(json));

	const response = await fetch("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1?" + searchParameters.toString());

	const responseJson = await response.json();

	const responseParseResult = IPlayerServiceGetOwnedGamesResponseSchema.safeParse(responseJson);

	if (!responseParseResult.success)
	{
		return null;
	}

	return responseParseResult.data.response.games.find(game => game.appid == Number(appId)) ?? null;
}

export async function fetchOwnedApps()
{
	const json =
	{
		steamid: configuration.steamUserId,
		include_appinfo: true,
		include_extended_appinfo: true,
		include_played_free_games: true,
	};

	const searchParameters = new URLSearchParams();

	searchParameters.set("key", configuration.steamApiKey);
	
	searchParameters.set("input_json", JSON.stringify(json));

	const response = await fetch("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1?" + searchParameters.toString());

	const responseJson = await response.json();

	const parseResponse = IPlayerServiceGetOwnedGamesResponseSchema.parse(responseJson);

	return parseResponse.response.games;
}

export async function fetchAppDetails(appId: string)
{
	const searchParameters = new URLSearchParams();

	searchParameters.set("appids", appId);

	const response = await fetch("https://store.steampowered.com/api/appdetails?" + searchParameters.toString());

	const responseJson = await response.json();

	const parsedResponse = AppDetailsResponseSchema.parse(responseJson);

	const appDetails = parsedResponse[appId.toString()];

	if (appDetails == null || !appDetails.success)
	{
		return null;
	}

	return appDetails.data;
}