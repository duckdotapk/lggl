//
// Imports
//

import "source-map-support/register.js";

import fs from "node:fs";
import path from "node:path";

import chalk from "chalk";

import { prismaClient } from "../_shared/instances/prismaClient.js";

import { configuration } from "../_shared/libs/Configuration.js";

//
// Functions
//

const shouldFixData = process.argv.includes("--fix");

const strictMode = process.argv.includes("--strict");

async function main()
{
	const games = await prismaClient.game.findMany(
		{
			include:
			{
				gameAntiCheats:
				{
					include:
					{
						antiCheat: true,
					},
				},
				gameDevelopers:
				{
					include:
					{
						company: true,
					},
				},
				gameDrms:
				{
					include:
					{
						drm: true,
					},
				},
				gameEngines:
				{
					include:
					{
						engine: true,
					},
				},
				gameGenres:
				{
					include:
					{
						genre: true,
					},
				},
				gameInstallations: true,
				gameModes:
				{
					include:
					{
						mode: true,
					},
				},
				gamePlatforms:
				{
					include:
					{
						platform: true,
					},
				},
				gamePlayActions:
				{
					include:
					{
						gamePlayActionSessions: true,
					},
				},
				gamePublishers:
				{
					include:
					{
						company: true,
					},
				},
				gameRatingBoardRatings:
				{
					include:
					{
						ratingBoardRating:
						{
							include:
							{
								ratingBoard: true,
							},
						},
					},
				},
				gameSources:
				{
					include:
					{
						source: true,
					},
				},
				seriesGames:
				{
					include:
					{
						series: true,
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

		if (strictMode && game.description == null)
		{
			problems.push(chalk.red("STRICT"), "description is null");
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

		if (game.progressionType == null)
		{
			problems.push("progressionType is null");
		}

		if (strictMode && game.completionStatus == null)
		{
			problems.push("completionStatus is null");
		}
		
		if (game.completionStatus == "TODO" && game.playCount > 0)
		{
			problems.push("completionStatus is TODO but playCount is greater than 0");
		}

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

		if (game.steamAppId != null && game.steamAppName == null)
		{
			problems.push("steamAppId is set but steamAppName is null");
		}

		//
		// Check Game Anti Cheats
		//

		if (strictMode && game.gameAntiCheats.length == 0)
		{
			problems.push(chalk.red("STRICT"), "no gameAntiCheats");
		}

		//
		// Check Game Developers
		//

		if (game.gameDevelopers.length == 0)
		{
			problems.push("no gameDevelopers");
		}

		//
		// Check Game Drms
		//

		if (strictMode && game.gameDrms.length == 0)
		{
			problems.push(chalk.red("STRICT"), "no gameDrms");
		}

		//
		// Check Game Engines
		//

		if (game.gameEngines.length == 0)
		{
			problems.push("no gameEngines");
		}

		//
		// Check Game Installations
		//

		if (game.gameInstallations.length == 0)
		{
			problems.push("no gameInstallations");
		}

		//
		// Check Game Modes
		//

		if (game.gameModes.length == 0)
		{
			problems.push("no gameModes");
		}

		//
		// Check Game Platforms
		//

		if (game.gamePlatforms.length == 0)
		{
			problems.push("no gamePlatforms");
		}

		//
		// Check Game Play Actions
		//

		if (game.gamePlayActions.length == 0)
		{
			problems.push("no gamePlayActions");
		}
		else
		{
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
		}

		//
		// Check Game Publishers
		//

		if (game.gamePublishers.length == 0)
		{
			problems.push("no gamePublishers");
		}

		//
		// Check Game Rating Board Ratings
		//

		if (strictMode && game.gameRatingBoardRatings.length == 0)
		{
			problems.push(chalk.red("STRICT"), "no gameRatingBoardRatings");
		}

		//
		// Check Game Sources
		//

		if (game.gameSources.length == 0)
		{
			problems.push("no gameSources");
		}

		//
		// Check Series Games
		//

		if (game.seriesGames.length == 0)
		{
			problems.push("no seriesGames");
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