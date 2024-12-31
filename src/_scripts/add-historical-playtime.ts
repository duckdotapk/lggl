//
// Imports
//

import { GamePlayActionOperatingSystem } from "@prisma/client";
import { prismaClient } from "../_shared/instances/prismaClient.js";
import { DateTime } from "luxon";

//
// Functions
//

async function main()
{
	if (process.argv[2] == null || process.argv[3] == null || process.argv[4] == null || process.argv[5] == null)
	{
		console.error("Usage: add-historical-playtime <gameId> <playTimeSeconds> <notes> <addToTotal=true|false>");

		process.exit(1);
	}

	const gameId = parseInt(process.argv[2]);

	if (isNaN(gameId))
	{
		console.error("Invalid game ID!");

		process.exit(1);
	}

	const playTimeSeconds = parseInt(process.argv[3]);

	if (isNaN(playTimeSeconds) || playTimeSeconds <= 0)
	{
		console.error("Invalid play time seconds!");

		process.exit(1);
	}

	const notes = process.argv[4];

	const gamePlayAction = await prismaClient.gamePlayAction.findFirst(
		{
			where:
			{
				game_id: gameId,
			},
		});

	const addToTotal = process.argv[5] === "true";

	if (gamePlayAction == null)
	{
		console.error("Game play action not found!");

		process.exit(1);
	}

	await prismaClient.gamePlayActionSession.create(
		{
			data:
			{
				sortOrder: -1,
				
				operatingSystem: GamePlayActionOperatingSystem.WINDOWS,
				startDate: DateTime.fromSeconds(0).toJSDate(),
				endDate: DateTime.fromSeconds(playTimeSeconds).toJSDate(),
				playTimeSeconds,
				addedToTotal: true,
				isHistorical: true,
				notes,

				gamePlayAction_id: gamePlayAction.id,
			},
		});

	if (addToTotal)
	{
		await prismaClient.game.update(
			{
				where:
				{
					id: gameId,
				},
				data:
				{
					playCount: { increment: 1 },
					playTimeTotalSeconds: { increment: playTimeSeconds },
				},
			});
	}
}

//
// Script
//

await main();