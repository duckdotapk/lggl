//
// Imports
//

import { DateTime } from "luxon";
import { z } from "zod";

import { LGGL_PLATFORM_ID_LINUX } from "../env/LGGL_PLATFORM_ID_LINUX.js";
import { LGGL_PLATFORM_ID_MAC } from "../env/LGGL_PLATFORM_ID_MAC.js";
import { LGGL_PLATFORM_ID_STEAM_DECK } from "../env/LGGL_PLATFORM_ID_STEAM_DECK.js";
import { LGGL_PLATFORM_ID_UNKNOWN } from "../env/LGGL_PLATFORM_ID_UNKNOWN.js";
import { LGGL_PLATFORM_ID_WINDOWS } from "../env/LGGL_PLATFORM_ID_WINDOWS.js";
import { LGGL_STEAM_API_KEY } from "../env/LGGL_STEAM_API_KEY.js";
import { LGGL_STEAM_ACCESS_TOKEN } from "../env/LGGL_STEAM_ACCESS_TOKEN.js";
import { LGGL_STEAM_USER_ID } from "../env/LGGL_STEAM_USER_ID.js";

import { prismaClient } from "../instances/prismaClient.js";

//
// Schemas
//

const IPlayerServiceClientGetLastPlayedTimesV1ResponseSchema = z.object(
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

const IFamilyGroupsServiceGetFamilyGroupForUserV1ResponseSchema = z.object(
	{
		response: z.object(
			{
				family_groupid: z.string(),
			}),
	});

const IFamilyGroupsServiceGetPlaytimeSummaryV1ResponseSchema = z.object(
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

//
// Types
//

type IPlayerServiceClientGetLastPlayedTimesV1Response = z.infer<typeof IPlayerServiceClientGetLastPlayedTimesV1ResponseSchema>;

type IFamilyGroupsServiceGetFamilyGroupForUserV1Response = z.infer<typeof IFamilyGroupsServiceGetFamilyGroupForUserV1ResponseSchema>;

type IFamilyGroupsServiceGetPlaytimeSummaryV1Response = z.infer<typeof IFamilyGroupsServiceGetPlaytimeSummaryV1ResponseSchema>;

//
// Functions
//

type FetchSteamDataResult =
{
	playerLastPlayedTimes: IPlayerServiceClientGetLastPlayedTimesV1Response["response"];
	familyGroupForUser: null;
	familyGroupPlaytimeSummary: null;
} |
{
	playerLastPlayedTimes: IPlayerServiceClientGetLastPlayedTimesV1Response["response"];
	familyGroupForUser: IFamilyGroupsServiceGetFamilyGroupForUserV1Response["response"];
	familyGroupPlaytimeSummary: IFamilyGroupsServiceGetPlaytimeSummaryV1Response["response"];
};

async function fetchSteamData(): Promise<FetchSteamDataResult>
{
	//
	// Get Player Last Played Times
	//

	const playerLastPlayedTimesSearchParameters = new URLSearchParams();

	playerLastPlayedTimesSearchParameters.set("key", LGGL_STEAM_API_KEY);

	const playerLastPlayedTimesResponse = await fetch("https://api.steampowered.com/IPlayerService/ClientGetLastPlayedTimes/v1?" + playerLastPlayedTimesSearchParameters.toString());

	const playerLastPlayedTimesResponseParseResult = IPlayerServiceClientGetLastPlayedTimesV1ResponseSchema.safeParse(await playerLastPlayedTimesResponse.json());

	if (!playerLastPlayedTimesResponseParseResult.success)
	{
		throw new Error("Failed to get client last played times: " + JSON.stringify(playerLastPlayedTimesResponseParseResult.error));
	}

	const playerLastPlayedTimes = playerLastPlayedTimesResponseParseResult.data.response;
	
	//
	// Get Family Group For User
	//

	const familyGroupForUserSearchParameters = new URLSearchParams();

	familyGroupForUserSearchParameters.set("access_token", LGGL_STEAM_ACCESS_TOKEN);

	familyGroupForUserSearchParameters.set("steamid", LGGL_STEAM_USER_ID);

	const familyGroupForUserResponse = await fetch("https://api.steampowered.com/IFamilyGroupsService/GetFamilyGroupForUser/v1?" + familyGroupForUserSearchParameters.toString());

	// TODO: make this work even if you're not in a family group, I don't think it will right now
	const familyGroupForUserResponseParseResult = IFamilyGroupsServiceGetFamilyGroupForUserV1ResponseSchema.safeParse(await familyGroupForUserResponse.json());

	if (!familyGroupForUserResponseParseResult.success)
	{
		return {
			playerLastPlayedTimes,
			familyGroupForUser: null,
			familyGroupPlaytimeSummary: null,
		};
	}

	const familyGroupId = parseInt(familyGroupForUserResponseParseResult.data.response.family_groupid);

	if (isNaN(familyGroupId))
	{
		return {
			playerLastPlayedTimes,
			familyGroupForUser: null,
			familyGroupPlaytimeSummary: null,
		};
	}

	const familyGroupForUser = familyGroupForUserResponseParseResult.data.response;

	//
	// Get Family Group Playtime Summary
	//

	const familyGroupPlaytimeSummarySearchParameters = new URLSearchParams();

	familyGroupPlaytimeSummarySearchParameters.set("access_token", LGGL_STEAM_ACCESS_TOKEN);

	familyGroupPlaytimeSummarySearchParameters.set("family_groupid", familyGroupForUser.family_groupid);

	const response = await fetch("https://api.steampowered.com/IFamilyGroupsService/GetPlaytimeSummary/v1?" + familyGroupPlaytimeSummarySearchParameters.toString(),
		{
			method: "POST",
		});

	const responseParseResult = IFamilyGroupsServiceGetPlaytimeSummaryV1ResponseSchema.safeParse(await response.json());

	if (!responseParseResult.success)
	{
		throw new Error("Failed to get family group playtime summary: " + JSON.stringify(responseParseResult.error));
	}

	const familyGroupPlaytimeSummary = responseParseResult.data.response;

	return {
		playerLastPlayedTimes,
		familyGroupForUser,
		familyGroupPlaytimeSummary,
	};
}

type PlayTime =
{
	firstPlayedTimestamp: number;
	lastPlayedTimestamp: number;

	windowsPlayTimeSeconds: number;
	macPlayTimeSeconds: number;
	linuxPlayTimeSeconds: number;
	steamDeckPlayTimeSeconds: number;
	unknownPlayTimeSeconds: number;
};

function getPlayTime(steamData: FetchSteamDataResult, steamAppId: number): PlayTime | null
{
	const ownedGame = steamData.playerLastPlayedTimes.games.find(game => game.appid === steamAppId);

	if (ownedGame != null)
	{
		return {
			firstPlayedTimestamp: ownedGame.first_playtime,
			lastPlayedTimestamp: ownedGame.last_playtime,
	
			windowsPlayTimeSeconds: ownedGame.playtime_windows_forever * 60,
			macPlayTimeSeconds: ownedGame.playtime_mac_forever * 60,
			linuxPlayTimeSeconds: (ownedGame.playtime_linux_forever - ownedGame.playtime_deck_forever) * 60,
			steamDeckPlayTimeSeconds: ownedGame.playtime_deck_forever * 60,
			unknownPlayTimeSeconds:
			(
				// Note: playtime_disconnected is apparently NOT included in playtime_forever
				//	playtime_deck_forever also should NOT be subtracted here, because it's included in playtime_linux_forever
				(
					ownedGame.playtime_forever -
					ownedGame.playtime_windows_forever -
					ownedGame.playtime_mac_forever -
					ownedGame.playtime_linux_forever
				) +
				ownedGame.playtime_disconnected
			) * 60,
		};
	}

	if (steamData.familyGroupForUser == null)
	{
		return null;
	}

	const entries =
	[
		// Note: I'm not sure if entries includes everything in entries_by_owner, so I'm including both just in case
		...steamData.familyGroupPlaytimeSummary.entries,
		...steamData.familyGroupPlaytimeSummary.entries_by_owner,
	];

	for (const entry of entries)
	{
		if (entry.steamid != LGGL_STEAM_USER_ID || entry.appid != steamAppId)
		{
			continue;
		}

		return {
			firstPlayedTimestamp: entry.first_played,
			lastPlayedTimestamp: entry.latest_played,

			windowsPlayTimeSeconds: 0,
			macPlayTimeSeconds: 0,
			linuxPlayTimeSeconds: 0,
			steamDeckPlayTimeSeconds: 0,
			unknownPlayTimeSeconds: entry.seconds_played,
		};
	};

	return null;
}

async function getNonHistoricalPlaytimeForPlatform(game_id: number, platform_id: number)
{
	const aggregate = await prismaClient.gamePlaySession.aggregate(
		{
			_sum:
			{
				playTimeSeconds: true,
			},
			where:
			{
				isHistorical: false,
				
				game_id,
				platform_id,
			},
		});

	return aggregate._sum.playTimeSeconds ?? 0;
}

async function createHistoricalGameActionPlaySession(game_id: number, platform_id: number, playTimeSeconds: number)
{
	const nonHistoricalPlayTimeSeconds = await getNonHistoricalPlaytimeForPlatform(game_id, platform_id);

	const historicalPlayTimeSeconds = playTimeSeconds - nonHistoricalPlayTimeSeconds;

	if (historicalPlayTimeSeconds <= 0)
	{
		return;
	}

	await prismaClient.gamePlaySession.create(
		{
			data:
			{				
				startDate: DateTime.fromSeconds(0).toJSDate(),
				endDate: DateTime.fromSeconds(playTimeSeconds).toJSDate(),
				playTimeSeconds: historicalPlayTimeSeconds,
				addedToTotal: true,
				isHistorical: true,
				notes: "Historical playtime from Steam.",

				game_id: game_id,
				platform_id: platform_id,
			},
		});
}

async function main()
{
	const steamData = await fetchSteamData();

	const games = await prismaClient.game.findMany(
		{
			where:
			{
				steamAppId: { not: null },
			},
			orderBy:
			{
				id: "asc",
			},
		});

	for (const game of games)
	{
		const playTime = await getPlayTime(steamData, game.steamAppId!);

		if (playTime == null)
		{
			continue;
		}

		console.log("Syncing historical playtime for %s...", game.name);

		await prismaClient.gamePlaySession.deleteMany(
			{
				where:
				{
					isHistorical: true,
					notes: "Historical playtime from Steam.",

					game_id: game.id,
				},
			});

		await createHistoricalGameActionPlaySession(game.id, LGGL_PLATFORM_ID_WINDOWS, playTime.windowsPlayTimeSeconds);

		await createHistoricalGameActionPlaySession(game.id, LGGL_PLATFORM_ID_MAC, playTime.macPlayTimeSeconds);

		await createHistoricalGameActionPlaySession(game.id, LGGL_PLATFORM_ID_LINUX, playTime.linuxPlayTimeSeconds);

		await createHistoricalGameActionPlaySession(game.id, LGGL_PLATFORM_ID_STEAM_DECK, playTime.steamDeckPlayTimeSeconds);

		await createHistoricalGameActionPlaySession(game.id, LGGL_PLATFORM_ID_UNKNOWN, playTime.unknownPlayTimeSeconds);

		await prismaClient.gamePlaySession.updateMany(
			{
				where:
				{
					game_id: game.id,
				},
				data:
				{
					addedToTotal: true,
				},
			});

		const aggregate = await prismaClient.gamePlaySession.aggregate(
			{
				_sum:
				{
					playTimeSeconds: true,
				},
				where:
				{
					game_id: game.id,
				},
			});

		const playTimeTotalSeconds = aggregate._sum.playTimeSeconds ?? 0;

		await prismaClient.game.update(
			{
				where:
				{
					id: game.id,
				},
				data:
				{
					playTimeTotalSeconds,
				},
			});
	}
}

//
// Script
//

await main();