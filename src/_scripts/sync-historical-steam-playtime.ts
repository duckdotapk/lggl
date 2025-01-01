//
// Imports
//

import { z } from "zod";

import { configuration } from "../_shared/libs/Configuration.js";
import { prismaClient } from "../_shared/instances/prismaClient.js";
import { DateTime } from "luxon";

//
// Functions
//

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

async function getPlayTimeFromClientLastPlayTimesEndpoint(steamAppId: number): Promise<PlayTime | null>
{
	const searchParameters = new URLSearchParams();

	searchParameters.set("key", configuration.steamApiKey);

	const clientGetLastPlayedTimesResponse = await fetch("https://api.steampowered.com/IPlayerService/ClientGetLastPlayedTimes/v1?" + searchParameters.toString());

	const clientGetLastPlayedTimesResponseParseResult = z.object(
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
		}).safeParse(await clientGetLastPlayedTimesResponse.json());

	if (!clientGetLastPlayedTimesResponseParseResult.success)
	{
		return null;
	}

	const ownedGame = clientGetLastPlayedTimesResponseParseResult.data.response.games.find(game => game.appid === steamAppId);

	if (ownedGame == null)
	{
		return null;
	}

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
			(
				ownedGame.playtime_forever -
				ownedGame.playtime_windows_forever -
				ownedGame.playtime_mac_forever -
				ownedGame.playtime_linux_forever -
				ownedGame.playtime_deck_forever
			) +
			ownedGame.playtime_disconnected
		) * 60,
	};
}

async function getSteamFamilyGroupId(): Promise<number | null>
{
	const searchParameters = new URLSearchParams();

	searchParameters.set("access_token", configuration.steamAccessToken);

	searchParameters.set("steamid", configuration.steamUserId);

	const response = await fetch("https://api.steampowered.com/IFamilyGroupsService/GetFamilyGroupForUser/v1?" + searchParameters.toString());

	const responseParseResult = z.object(
		{
			response: z.object(
				{
					family_groupid: z.string(),
				}),
		}).safeParse(await response.json());

	if (!responseParseResult.success)
	{
		return null;
	}

	const familyGroupId = parseInt(responseParseResult.data.response.family_groupid);

	if (isNaN(familyGroupId))
	{
		return null;
	}

	return familyGroupId;
}

async function getPlayTimeFromGetPlaytimeSummaryEndpoint(steamAppId: number, steamFamilyGroupId: number): Promise<PlayTime | null>
{
	const searchParameters = new URLSearchParams();

	searchParameters.set("access_token", configuration.steamAccessToken);

	searchParameters.set("family_groupid", steamFamilyGroupId.toString());

	const response = await fetch("https://api.steampowered.com/IFamilyGroupsService/GetPlaytimeSummary/v1?" + searchParameters.toString(),
		{
			method: "POST",
		});

	const responseParseResult = z.object(
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
		}).safeParse(await response.json());

	if (!responseParseResult.success)
	{
		return null;
	}

	const entries =
	[
		// Note: I'm not sure if entries includes everything in entries_by_owner, so I'm including both just in case
		...responseParseResult.data.response.entries,
		...responseParseResult.data.response.entries_by_owner,
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

async function getSteamPlayTime(steamAppId: number): Promise<PlayTime | null>
{
	const playTimeFromClientLastPlayTimesEndpoint = await getPlayTimeFromClientLastPlayTimesEndpoint(steamAppId);

	if (playTimeFromClientLastPlayTimesEndpoint != null)
	{
		return playTimeFromClientLastPlayTimesEndpoint;
	}

	const steamFamilyGroupId = await getSteamFamilyGroupId();

	if (steamFamilyGroupId == null)
	{
		return null;
	}

	const playTimeFromGetPlaytimeSummaryEndpoint = await getPlayTimeFromGetPlaytimeSummaryEndpoint(steamAppId, steamFamilyGroupId);

	if (playTimeFromGetPlaytimeSummaryEndpoint != null)
	{
		return playTimeFromGetPlaytimeSummaryEndpoint;
	}

	return null;
}

async function getNonHistoricalPlaytimeForPlatform(gameId: number, platformId: number)
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
					game_id: gameId,
				},
				platform_id: platformId,
			},
		});

	return aggregate._sum.playTimeSeconds ?? 0;
}

async function createHistoricalGameActionPlaySession(gamePlayActionId: number, platformId: number, playTimeSeconds: number)
{
	await prismaClient.gamePlayActionSession.create(
		{
			data:
			{
				sortOrder: -1,
				
				startDate: DateTime.fromSeconds(0).toJSDate(),
				endDate: DateTime.fromSeconds(playTimeSeconds).toJSDate(),
				playTimeSeconds,
				addedToTotal: true,
				isHistorical: true,
				notes: "Historical playtime from Steam.",

				gamePlayAction_id: gamePlayActionId,
				platform_id: platformId,
			},
		});
}

async function main()
{
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

		const playTime = await getSteamPlayTime(parseInt(game.steamAppId!));

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

		if (playTime.windowsPlayTimeSeconds > 0)
		{
			await createHistoricalGameActionPlaySession(gamePlayAction.id, configuration.platformIds.windows, playTime.windowsPlayTimeSeconds - nonHistoricalWindowsPlayTime);
		}

		if (playTime.macPlayTimeSeconds > 0)
		{
			await createHistoricalGameActionPlaySession(gamePlayAction.id, configuration.platformIds.mac, playTime.macPlayTimeSeconds - nonHistoricalMacPlayTime);
		}

		if (playTime.linuxPlayTimeSeconds > 0)
		{
			await createHistoricalGameActionPlaySession(gamePlayAction.id, configuration.platformIds.linux, playTime.linuxPlayTimeSeconds - nonHistoricalLinuxPlayTime);
		}

		if (playTime.steamDeckPlayTimeSeconds > 0)
		{
			await createHistoricalGameActionPlaySession(gamePlayAction.id, configuration.platformIds.steamDeck, playTime.steamDeckPlayTimeSeconds - nonHistoricalSteamDeckPlayTime);
		}

		if (playTime.unknownPlayTimeSeconds > 0)
		{
			await createHistoricalGameActionPlaySession(gamePlayAction.id, configuration.platformIds.unknown, playTime.unknownPlayTimeSeconds - nonHistoricalUnknownPlayTime);
		}

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