//
// Imports
//

import { z } from "zod";

import { configuration } from "../_shared/libs/Configuration.js";
import { prismaClient } from "../_shared/instances/prismaClient.js";
import { DateTime } from "luxon";

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

	playerLastPlayedTimesSearchParameters.set("key", configuration.steamApiKey);

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

	familyGroupForUserSearchParameters.set("access_token", configuration.steamAccessToken);

	familyGroupForUserSearchParameters.set("steamid", configuration.steamUserId);

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

	familyGroupPlaytimeSummarySearchParameters.set("access_token", configuration.steamAccessToken);

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
		if (entry.steamid != configuration.steamUserId || entry.appid != steamAppId)
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
	const aggregate = await prismaClient.gamePlayActionSession.aggregate(
		{
			_sum:
			{
				playTimeSeconds: true,
			},
			where:
			{
				isHistorical: false,
				
				gamePlayAction:
				{
					game_id: game_id,
				},
				platform_id: platform_id,
			},
		});

	return aggregate._sum.playTimeSeconds ?? 0;
}

async function createHistoricalGameActionPlaySession(sortOrder: number, gamePlayAction_id: number, platform_id: number, playTimeSeconds: number)
{
	if (playTimeSeconds <= 0)
	{
		return;
	}

	await prismaClient.gamePlayActionSession.create(
		{
			data:
			{
				sortOrder,
				
				startDate: DateTime.fromSeconds(0).toJSDate(),
				endDate: DateTime.fromSeconds(playTimeSeconds).toJSDate(),
				playTimeSeconds,
				addedToTotal: true,
				isHistorical: true,
				notes: "Historical playtime from Steam.",

				gamePlayAction_id: gamePlayAction_id,
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
			include:
			{
				gamePlayActions: true,
			},
			orderBy:
			{
				id: "asc",
			},
		});

	for (const game of games)
	{
		const gamePlayAction = game.gamePlayActions[0];

		if (gamePlayAction == null)
		{
			throw new Error("Game #" + game.id + " has no game play action!");
		}

		const playTime = await getPlayTime(steamData, parseInt(game.steamAppId!));

		if (playTime == null)
		{
			continue;
		}

		console.log("Syncing historical playtime for %s...", game.name);

		const nonHistoricalWindowsPlayTime = await getNonHistoricalPlaytimeForPlatform(game.id, configuration.platformIds.windows);
		const nonHistoricalMacPlayTime = await getNonHistoricalPlaytimeForPlatform(game.id, configuration.platformIds.mac);
		const nonHistoricalLinuxPlayTime = await getNonHistoricalPlaytimeForPlatform(game.id, configuration.platformIds.linux);
		const nonHistoricalSteamDeckPlayTime = await getNonHistoricalPlaytimeForPlatform(game.id, configuration.platformIds.steamDeck);
		const nonHistoricalUnknownPlayTime = await getNonHistoricalPlaytimeForPlatform(game.id, configuration.platformIds.unknown);

		await prismaClient.gamePlayActionSession.deleteMany(
			{
				where:
				{
					isHistorical: true,
					notes: "Historical playtime from Steam.",

					gamePlayAction_id: gamePlayAction.id,
				},
			});

		await createHistoricalGameActionPlaySession(-1, gamePlayAction.id, configuration.platformIds.windows, playTime.windowsPlayTimeSeconds - nonHistoricalWindowsPlayTime);

		await createHistoricalGameActionPlaySession(-2, gamePlayAction.id, configuration.platformIds.mac, playTime.macPlayTimeSeconds - nonHistoricalMacPlayTime);

		await createHistoricalGameActionPlaySession(-3, gamePlayAction.id, configuration.platformIds.linux, playTime.linuxPlayTimeSeconds - nonHistoricalLinuxPlayTime);

		await createHistoricalGameActionPlaySession(-4, gamePlayAction.id, configuration.platformIds.steamDeck, playTime.steamDeckPlayTimeSeconds - nonHistoricalSteamDeckPlayTime);

		await createHistoricalGameActionPlaySession(-5, gamePlayAction.id, configuration.platformIds.unknown, playTime.unknownPlayTimeSeconds - nonHistoricalUnknownPlayTime);

		await prismaClient.gamePlayActionSession.updateMany(
			{
				where:
				{
					gamePlayAction_id: gamePlayAction.id,
				},
				data:
				{
					addedToTotal: true,
				},
			});

		const aggregate = await prismaClient.gamePlayActionSession.aggregate(
			{
				_sum:
				{
					playTimeSeconds: true,
				},
				where:
				{
					gamePlayAction_id: gamePlayAction.id,
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