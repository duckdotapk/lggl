//
// Imports
//

import "source-map-support/register.js";

import fs from "node:fs";
import path from "node:path";

import { prismaClient } from "../_shared/instances/prismaClient.js";

import { configuration } from "../_shared/libs/Configuration.js";

//
// Functions
//

const shouldFixData = process.argv.includes("--fix");

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

		if (game.completionStatus == "TODO" && game.playTimeTotalSeconds > 0)
		{
			if (!shouldFixData)
			{
				problems.push("completionStatus is TODO but playTimeTotalSeconds is greater than 0");
			}
			else
			{
				await prismaClient.game.update(
					{
						where:
						{
							id: game.id,
						},
						data:
						{
							completionStatus: "IN_PROGRESS",
						},
					});
			}
		}

		if (game.releaseDate == null)
		{
			problems.push("releaseDate is null");
		}

		if (game.bannerImagePath == null)
		{
			problems.push("bannerImagePath is null");
		}
		else if (!fs.existsSync(path.join(configuration.dataDirectory, game.bannerImagePath.slice(5))))
		{
			problems.push("bannerImagePath does not exist on disk");
		}

		if (game.coverImagePath == null)
		{
			problems.push("coverImagePath is null");
		}
		else if (!fs.existsSync(path.join(configuration.dataDirectory, game.coverImagePath.slice(5))))
		{
			problems.push("coverImagePath does not exist on disk");
		}

		if (game.iconImagePath == null)
		{
			problems.push("iconImagePath is null");
		}
		else if (!fs.existsSync(path.join(configuration.dataDirectory, game.iconImagePath.slice(5))))
		{
			problems.push("iconImagePath does not exist on disk");
		}

		if (game.logoImagePath == null)
		{
			problems.push("logoImagePath is null");
		}
		else if (!fs.existsSync(path.join(configuration.dataDirectory, game.logoImagePath.slice(5))))
		{
			problems.push("logoImagePath does not exist on disk");
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