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

export const IFamilyGroupsServiceGetFamilyGroupForUserV1ResponseSchema = z.object(
	{
		response: z.object(
			{
				family_groupid: z.string(),
			}),
	});

export const IFamilyGroupsServiceGetPlaytimeSummaryV1ResponseSchema = z.object(
	{
		response: z.object(
			{
				entries: z.array(z.object(
					{
						steamid: z.string(),
						appid: z.number(),
						first_played: z.number(),
						latest_played: z.number(),
						seconds_played: z.number(),
					})),

				entries_by_owner: z.array(z.object(
					{
						steamid: z.string(),
						appid: z.number(),
						first_played: z.number(),
						latest_played: z.number(),
						seconds_played: z.number(),
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
						playtime_disconnected: z.number(),
					})),
			}),
	});

export const IPlayerServiceGetOwnedGamesResponseSchema = z.object(
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

export type IFamilyGroupsServiceGetFamilyGroupForUserV1Response = z.infer<typeof IFamilyGroupsServiceGetFamilyGroupForUserV1ResponseSchema>;

export type IFamilyGroupsServiceGetPlaytimeSummaryV1Response = z.infer<typeof IFamilyGroupsServiceGetPlaytimeSummaryV1ResponseSchema>;

export type IPlayerServiceClientGetLastPlayedTimesV1Response = z.infer<typeof IPlayerServiceClientGetLastPlayedTimesV1ResponseSchema>;

export type IPlayerServiceGetOwnedGamesResponse = z.infer<typeof IPlayerServiceGetOwnedGamesResponseSchema>;

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

export async function fetchFamilyGroupForUser(accessToken: string, steamUserId: string)
{
	const searchParameters = new URLSearchParams();

	searchParameters.set("access_token", accessToken);

	searchParameters.set("steamid", steamUserId);

	const response = await fetch("https://api.steampowered.com/IFamilyGroupsService/GetFamilyGroupForUser/v1?" + searchParameters.toString());

	const responseJson = await response.json();

	const responseParseResult = IFamilyGroupsServiceGetFamilyGroupForUserV1ResponseSchema.safeParse(responseJson);

	return !responseParseResult.success
		? null
		: responseParseResult.data.response;
}

export async function fetchFamilyGroupPlaytimeSummary(accessToken: string, familyGroupId: string)
{
	const familyGroupPlaytimeSummarySearchParameters = new URLSearchParams();

	familyGroupPlaytimeSummarySearchParameters.set("access_token", accessToken);

	familyGroupPlaytimeSummarySearchParameters.set("family_groupid", familyGroupId);

	const response = await fetch("https://api.steampowered.com/IFamilyGroupsService/GetPlaytimeSummary/v1?" + familyGroupPlaytimeSummarySearchParameters.toString(),
		{
			method: "POST",
		});

	const responseParseResult = IFamilyGroupsServiceGetPlaytimeSummaryV1ResponseSchema.safeParse(await response.json());

	if (!responseParseResult.success)
	{
		throw new Error("Failed to get family group playtime summary: " + JSON.stringify(responseParseResult.error));
	}

	return responseParseResult.data.response;
}

export async function fetchClientLastPlayedTimes(apiKey: string)
{
	const playerLastPlayedTimesSearchParameters = new URLSearchParams();

	playerLastPlayedTimesSearchParameters.set("key", apiKey);

	const playerLastPlayedTimesResponse = await fetch("https://api.steampowered.com/IPlayerService/ClientGetLastPlayedTimes/v1?" + playerLastPlayedTimesSearchParameters.toString());

	const playerLastPlayedTimesResponseParseResult = IPlayerServiceClientGetLastPlayedTimesV1ResponseSchema.safeParse(await playerLastPlayedTimesResponse.json());

	if (!playerLastPlayedTimesResponseParseResult.success)
	{
		throw new Error("Failed to get client last played times: " + JSON.stringify(playerLastPlayedTimesResponseParseResult.error));
	}

	return playerLastPlayedTimesResponseParseResult.data.response;
}

export async function fetchOwnedGames(apiKey: string, steamUserId: string)
{
	const searchParameters = new URLSearchParams();

	searchParameters.set("key",apiKey);
	
	searchParameters.set("input_json", JSON.stringify(
		{
			steamid: steamUserId,
			include_appinfo: true,
			include_extended_appinfo: true,
			include_played_free_games: true,
		}));

	const response = await fetch("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1?" + searchParameters.toString());

	const responseJson = await response.json();

	const parseResponse = IPlayerServiceGetOwnedGamesResponseSchema.parse(responseJson);

	return parseResponse.response;
}

//
// Utility Functions
//

export function fetchImageUrls(steamAppId: number, ownedGame: IPlayerServiceGetOwnedGamesResponse["response"]["games"][0] | null)
{
	return {
		icon: ownedGame != null
			? ("https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/" + steamAppId + "/" + ownedGame.img_icon_url + ".jpg")
			: null,
		libraryBackground: "https://cdn.cloudflare.steamstatic.com/steam/apps/" + steamAppId + "/library_hero.jpg",
		libraryCapsule: "https://cdn.cloudflare.steamstatic.com/steam/apps/" + steamAppId + "/library_600x900_2x.jpg",
		libraryLogo: "https://cdn.cloudflare.steamstatic.com/steam/apps/" + steamAppId + "/logo.png",
	};
}