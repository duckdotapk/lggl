//
// Imports
//

import { GamePlayActionOperatingSystem, GamePlayActionType, Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { prismaClient } from "../_shared/instances/prismaClient.js";

import * as SteamThirdPartyLib from "../_shared/libs/third-party/Steam.js";

//
// Functions
//

async function createHistoricalGamePlayActionSession(transactionClient: Prisma.TransactionClient, gamePlayAction: Prisma.GamePlayActionGetPayload<null>, operatingSystem: GamePlayActionOperatingSystem, playTimeSeconds: number)
{
	if (playTimeSeconds <= 0)
	{
		return;
	}

	await transactionClient.gamePlayActionSession.create(
		{
			data:
			{
				sortOrder: -1,

				operatingSystem,
				startDate: DateTime.fromSeconds(0).toJSDate(),
				endDate: DateTime.fromSeconds(playTimeSeconds).toJSDate(),
				playTimeSeconds,
				isHistorical: true,
				notes: "Historical playtime data from Steam.",

				gamePlayAction_id: gamePlayAction.id,
			},
		});
}

async function createGamePlayAction(transactionClient: Prisma.TransactionClient, game: Prisma.GameGetPayload<{ include: { gameInstallations: true } }>)
{
	if (game.steamAppId == null)
	{
		throw new Error("Game does not have a Steam App ID: " + game.id);
	}

	const gameInstallation = game.gameInstallations[0];

	if (gameInstallation == null)
	{
		throw new Error("Game does not have an installation: " + game.id);
	}

	const gamePlayAction = await transactionClient.gamePlayAction.create(
		{
			data:
			{
				name: "Launch via Steam",
				type: GamePlayActionType.STEAM,
				path: "steam://run/" + game.steamAppId,
				trackingPath: gameInstallation.path,

				game_id: game.id,
			},
		});

	const ownedApp = await SteamThirdPartyLib.fetchOwnedApp(game.steamAppId);

	if (ownedApp == null)
	{
		throw new Error("Could not fetch owned app data for game: " + game.id);
	}

	const playtimeWindowsSeconds = ownedApp.playtime_windows_forever * 60;

	await createHistoricalGamePlayActionSession(transactionClient, gamePlayAction, GamePlayActionOperatingSystem.WINDOWS, playtimeWindowsSeconds);

	const playtimeMacSeconds = ownedApp.playtime_mac_forever * 60;

	await createHistoricalGamePlayActionSession(transactionClient, gamePlayAction, GamePlayActionOperatingSystem.MAC, playtimeMacSeconds);

	// Note: Playtime on Deck counts as BOTH Linux and Steam Deck playtime
	//	I want to record it separately here
	const playtimeLinuxSeconds = (ownedApp.playtime_linux_forever - ownedApp.playtime_deck_forever) * 60;

	await createHistoricalGamePlayActionSession(transactionClient, gamePlayAction, GamePlayActionOperatingSystem.LINUX, playtimeLinuxSeconds);

	const playtimeSteamDeckSeconds = ownedApp.playtime_deck_forever * 60;

	await createHistoricalGamePlayActionSession(transactionClient, gamePlayAction, GamePlayActionOperatingSystem.LINUX_STEAM_DECK, playtimeSteamDeckSeconds);
}

async function main()
{
	const games = await prismaClient.game.findMany(
		{
			where:
			{
				gamePlayActions:
				{
					none: {},
				},

				steamAppId: { not: null },
			},
			include:
			{
				gameInstallations: true,
			},
		});

	for (const game of games)
	{
		console.log("Processing game: %s | Steam app ID: %s", game.name, game.steamAppId);

		try
		{
			await prismaClient.$transaction(
				async (transactionClient) =>
				{
					await createGamePlayAction(transactionClient, game);
				});
		}
		catch (error)
		{
			console.error("Error processing game: %s | Steam app ID: %s | Error: %s", game.name, game.steamAppId, error instanceof Error ? error.message : error);
		}
	}

	await prismaClient.$disconnect();
}

//
// Script
//

await main();