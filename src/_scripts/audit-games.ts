//
// Imports
//

import "source-map-support/register.js";

import { prismaClient } from "../_shared/instances/prismaClient.js";

//
// Functions
//

async function main()
{
	const games = await prismaClient.game.findMany(
		{
			include:
			{
				gamePlayActions:
				{
					include:
					{
						gamePlayActionSessions: true,
					},
				},
			},
			orderBy:
			{
				id: "asc",
			},
		});

	for (const game of games)
	{
		const problems: string[] = [];

		//
		// Check Game Model
		//

		if (game.releaseDate == null)
		{
			problems.push("releaseDate is null");
		}

		if (game.bannerImagePath == null)
		{
			problems.push("bannerImagePath is null");
		}

		if (game.coverImagePath == null)
		{
			problems.push("coverImagePath is null");
		}

		if (game.iconImagePath == null)
		{
			problems.push("iconImagePath is null");
		}

		if (game.gamePlayActions.length == 0)
		{
			problems.push("no gamePlayActions");
		}

		let playTimeTotalSecondsFromGamePlayActionSessions = 0;

		for (const gamePlayAction of game.gamePlayActions)
		{
			for (const gamePlayActionSession of gamePlayAction.gamePlayActionSessions)
			{
				playTimeTotalSecondsFromGamePlayActionSessions += gamePlayActionSession.playTimeSeconds;
			}
		}

		if (game.playTimeTotalSeconds != playTimeTotalSecondsFromGamePlayActionSessions)
		{
			const difference = game.playTimeTotalSeconds - playTimeTotalSecondsFromGamePlayActionSessions;

			problems.push("playTimeTotalSeconds differs from gamePlayActionSessions total: " + difference);
		}

		//
		// Log Problems
		//

		if (problems.length == 0)
		{
			continue;
		}

		console.group("Game #" + game.id + " - " + game.name + " (Steam app ID: " + game.steamAppId + ")");

		for (const problem of problems)
		{
			console.log(problem);
		}

		console.groupEnd();
	}
}

//
// Script
//

await main();