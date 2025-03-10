//
// Imports
//

import { z } from "zod";

//
// Schemas
//

// Schema based on:
//	https://store.steampowered.com/api/appdetails?appids=220
//	https://store.steampowered.com/api/appdetails?appids=12200
//	https://wiki.teamfortress.com/wiki/User:RJackson/StorefrontAPI#Global_parameters
export const AppDetailsResponseSchema = z.record(z.string(), z.union(
	[
		z.object(
			{
				success: z.literal(true),
				data: z.object(
					{
						name: z.string(),
						steam_appid: z.number(),

						short_description: z.string(),

						developers: z.array(z.string()),
						publishers: z.array(z.string()),

						platforms: z.object(
							{
								windows: z.boolean(),
								mac: z.boolean(),
								linux: z.boolean(),
							}),

						categories: z.array(z.object(
							{
								id: z.number(),
								description: z.string(),
							})),
						genres: z.array(z.object(
							{
								id: z.string(),
								description: z.string(), 
							})), 

						release_date: z.object(
							{
								coming_soon: z.boolean(),
								date: z.string(),
							}),
				}),
			}),

		z.object(
			{
				success: z.literal(false),
			}),
	]));

export const ICommunityServiceGetAppsV1ResponseSchema = z.object(
	{
		response: z.object(
			{
				apps: z.array(z.object(
					{
						appid: z.number(),
						name: z.string(),
						icon: z.string(),
						community_visible_stats: z.boolean().optional(),
						propagation: z.string(),
						app_type: z.number(),
						content_descriptorids: z.array(z.number()).optional(),
					})),
			}),
	});

export const IPlayerServiceClientGetLastPlayedTimesV1ResponseSchema = z.object(
	{
		response: z.object(
			{
				games: z.array(z.object(
					{
						appid: z.number(),
						last_playtime: z.number(),
						playtime_forever: z.number(),
						first_playtime: z.number(),
						playtime_windows_forever: z.number(),
						playtime_mac_forever: z.number(),
						playtime_linux_forever: z.number(),
						playtime_deck_forever: z.number(),
						first_windows_playtime: z.number(),
						first_mac_playtime: z.number(),
						first_linux_playtime: z.number(),
						first_deck_playtime: z.number(),
						last_windows_playtime: z.number(),
						last_mac_playtime: z.number(),
						last_linux_playtime: z.number(),
						last_deck_playtime: z.number(),
						playtime_disconnected: z.number(),
					})),
			}),
	});

export const IPlayerServiceGetOwnedGamesV1ResponseSchema = z.object(
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
						has_community_visible_stats: z.boolean().nullish(),
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

//
// Types
//

export type AppDetailsResponse = z.infer<typeof AppDetailsResponseSchema>;

export type ICommunityServiceGetAppsV1Response = z.infer<typeof ICommunityServiceGetAppsV1ResponseSchema>;

export type IPlayerServiceClientGetLastPlayedTimesV1Response = z.infer<typeof IPlayerServiceClientGetLastPlayedTimesV1ResponseSchema>;

export type IPlayerServiceGetOwnedGamesV1Response = z.infer<typeof IPlayerServiceGetOwnedGamesV1ResponseSchema>;

//
// API Functions
//

export async function fetchAppDetails(steamAppId: number)
{
	const searchParameters = new URLSearchParams();

	searchParameters.set("appids", steamAppId.toString());

	const response = await fetch("https://store.steampowered.com/api/appdetails?" + searchParameters.toString());

	const responseJson = await response.json();

	const parsedResponse = AppDetailsResponseSchema.parse(responseJson);

	const appDetails = parsedResponse[steamAppId.toString()];

	if (appDetails == null || !appDetails.success)
	{
		return null;
	}

	return appDetails.data;
}

export async function callCommunityServiceGetAppsV1(steamAppIds: number[])
{
	const searchParameters = new URLSearchParams();

	for (const [ steamAppIdIndex, steamAppId ] of steamAppIds.entries())
	{
		searchParameters.set("appids[" + steamAppIdIndex + "]", steamAppId.toString());
	}

	const response = await fetch("https://api.steampowered.com/ICommunityService/GetApps/v1/?" + searchParameters.toString());

	const responseParseResult = ICommunityServiceGetAppsV1ResponseSchema.safeParse(await response.json());

	if (!responseParseResult.success)
	{
		throw new Error("Failed to get apps: " + JSON.stringify(responseParseResult.error));
	}

	return responseParseResult.data.response;
}

export async function callPlayServiceClientGetLastPlayedTimesV1(steamApiKey: string)
{
	const searchParameters = new URLSearchParams();

	searchParameters.set("key", steamApiKey);

	const response = await fetch("https://api.steampowered.com/IPlayerService/ClientGetLastPlayedTimes/v1?" + searchParameters.toString());

	const responseParseResult = IPlayerServiceClientGetLastPlayedTimesV1ResponseSchema.safeParse(await response.json());

	if (!responseParseResult.success)
	{
		throw new Error("Failed to get client last played times: " + JSON.stringify(responseParseResult.error));
	}

	return responseParseResult.data.response;
}

export async function callPlayerServiceGetOwnedGamesV1(steamApiKey: string, steamUserId: string)
{
	const searchParameters = new URLSearchParams();

	searchParameters.set("key", steamApiKey);
	
	searchParameters.set("input_json", JSON.stringify(
		{
			steamid: steamUserId,
			include_appinfo: true,
			include_extended_appinfo: true,
			include_played_free_games: true,
		}));

	const response = await fetch("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1?" + searchParameters.toString());

	const responseJson = await response.json();

	const parseResponse = IPlayerServiceGetOwnedGamesV1ResponseSchema.parse(responseJson);

	return parseResponse.response;
}

//
// Utility Functions
//

export async function fetchImageUrls(steamAppId: number)
{
	const communityServiceGetAppsResponse = await callCommunityServiceGetAppsV1([ steamAppId ]);

	const app = communityServiceGetAppsResponse.apps[0];

	if (app == null)
	{
		throw new Error("Failed to get app: " + steamAppId);
	}

	return {
		icon: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/" + steamAppId + "/" + app.icon + ".jpg",
		libraryBackground: "https://cdn.cloudflare.steamstatic.com/steam/apps/" + steamAppId + "/library_hero.jpg",
		libraryCapsule: "https://cdn.cloudflare.steamstatic.com/steam/apps/" + steamAppId + "/library_600x900_2x.jpg",
		libraryLogo: "https://cdn.cloudflare.steamstatic.com/steam/apps/" + steamAppId + "/logo.png",
	};
}