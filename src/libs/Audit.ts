//
// Imports
//

import fs from "node:fs";

import { Prisma } from "@prisma/client";

import { prismaClient } from "../instances/prismaClient.js";

import * as GameModelLib from "./models/Game.js";

import * as GameCompanySchemaLib from "./schemas/GameCompany.js";

//
// Classes
//

export class Problem
{
	description: string;
	isAutoFixable: boolean;
	wasAutomaticallyFixed: boolean;

	constructor(description: string, isFixable: boolean)
	{
		this.description = description;
		this.isAutoFixable = isFixable;
		this.wasAutomaticallyFixed = false;
	}
}

export class ProblemList
{
	game: Prisma.GameGetPayload<null>;

	problems: Problem[];

	constructor(game: Prisma.GameGetPayload<null>)
	{
		this.game = game;
		this.problems = [];
	}

	addProblem(description: string, isFixable: boolean)
	{
		const problem = new Problem(description, isFixable);

		this.problems.push(problem);

		return problem;
	}
}

//
// Utility Functions
//

export type AuditGameGame = Prisma.GameGetPayload<
	{
		include:
		{
			gameCompanies: true;
			gameEngines: true;
			gameGenres: true;
			gameInstallations: true;
			gameLinks: true;
			gameModes: true;
			gamePlatforms: true;
			gamePlayActions: true;
			gamePlaySessions: true;
			seriesGames: true;
		},
	}>;

export async function auditGame(game: AuditGameGame, autoFixProblems: boolean): Promise<ProblemList>
{
	//
	// Create Problem List
	//

	const problemList = new ProblemList(game);

	//
	// Check Game
	//

	// Metadata
	if (game.releaseDate == null && !game.isUnreleased)
	{
		problemList.addProblem("releaseDate is null", false);
	}

	if (game.description == null)
	{
		problemList.addProblem("description is null", false);
	}

	// Images
	const imagePaths = GameModelLib.getImagePaths(game);

	if (game.hasBannerImage && !fs.existsSync(imagePaths.banner!))
	{
		const problem = problemList.addProblem("hasBannerImage is true but banner image does not exist on disk", true);

		if (autoFixProblems)
		{
			await prismaClient.game.update(
				{
					where:
					{
						id: game.id,
					},
					data:
					{
						hasBannerImage: false,
					},
				});

			problem.wasAutomaticallyFixed = true;
		}
	}

	if (game.hasCoverImage && !fs.existsSync(imagePaths.cover!))
	{
		const problem = problemList.addProblem("hasCoverImage is true but cover image does not exist on disk", true);

		if (autoFixProblems)
		{
			await prismaClient.game.update(
				{
					where:
					{
						id: game.id,
					},
					data:
					{
						hasCoverImage: false,
					},
				});

			problem.wasAutomaticallyFixed = true;
		}
	}

	if (game.hasIconImage && !fs.existsSync(imagePaths.icon!))
	{
		const problem = problemList.addProblem("hasIconImage is true but icon image does not exist on disk", true);

		if (autoFixProblems)
		{
			await prismaClient.game.update(
				{
					where:
					{
						id: game.id,
					},
					data:
					{
						hasIconImage: false,
					},
				});

			problem.wasAutomaticallyFixed = true;
		}
	}

	if (game.hasLogoImage && !fs.existsSync(imagePaths.logo!))
	{
		const problem = problemList.addProblem("hasLogoImage is true but logo image does not exist on disk", true);

		if (autoFixProblems)
		{
			await prismaClient.game.update(
				{
					where:
					{
						id: game.id,
					},
					data:
					{
						hasLogoImage: false,
					},
				});

			problem.wasAutomaticallyFixed = true;
		}
	}

	// Flags

	// Play Data
	if (game.progressionType == null)
	{
		problemList.addProblem("progressionType is null", false);
	}

	if (game.completionStatus == null && game.progressionType != "NONE")
	{
		problemList.addProblem("completionStatus is null", false);
	}
	
	if (game.completionStatus == "TODO" && game.playCount > 0)
	{
		problemList.addProblem("completionStatus is TODO but playCount is greater than 0", false);
	}

	if (game.completionStatus == "TODO" && game.playTimeTotalSeconds > 0)
	{
		const problem = problemList.addProblem("completionStatus is TODO but playTimeTotalSeconds is greater than 0", true);

		if (autoFixProblems)
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

			problem.wasAutomaticallyFixed = true;
		}
	}

	if (game.steamAppId != null && game.steamAppName == null)
	{
		problemList.addProblem("steamAppId is set but steamAppName is null", false);
	}

	//
	// Check Game Companies
	//

	const gameDevelopers = game.gameCompanies.filter((gameCompany) => gameCompany.type == "DEVELOPER" satisfies GameCompanySchemaLib.Type);

	if (gameDevelopers.length == 0)
	{
		problemList.addProblem("no gameDevelopers", false);
	}

	const gamePublishers = game.gameCompanies.filter((gameCompany) => gameCompany.type == "PUBLISHER" satisfies GameCompanySchemaLib.Type);

	if (gamePublishers.length == 0)
	{
		problemList.addProblem("no gamePublishers", false);
	}

	//
	// Check Game Engines
	//

	const gameEngines = await prismaClient.gameEngine.findMany(
		{
			where:
			{
				game_id: game.id,
			},
		});

	if (gameEngines.length == 0 && !game.isUnknownEngine)
	{
		problemList.addProblem("game is not marked as having an unknown engine but has no gameEngines", false);
	}

	if (gameEngines.length > 0 && game.isUnknownEngine)
	{
		problemList.addProblem("game is marked as having an unknown engine but has gameEngines", false);
	}

	//
	// Check Game Installations
	//

	for (const gameInstallation of game.gameInstallations)
	{
		if (!fs.existsSync(gameInstallation.path))
		{
			const problem = problemList.addProblem("gameInstallation #" + gameInstallation.id + ": path does not exist: " + gameInstallation.path, true);

			if (autoFixProblems)
			{
				await prismaClient.gameInstallation.delete(
					{
						where:
						{
							id: gameInstallation.id,
						},
					});

				problem.wasAutomaticallyFixed = true;
			}
		}
	}

	// Note: this is re-queried because some may have been deleted in the previous step
	const gameInstallations = await prismaClient.gameInstallation.findMany(
		{
			where:
			{
				game_id: game.id,
			},
		});

	if (game.isInstalled && gameInstallations.length == 0)
	{
		const problem = problemList.addProblem("isInstalled is true but game has no gameInstallations", true);

		if (autoFixProblems)
		{
			await prismaClient.game.update(
				{
					where:
					{
						id: game.id,
					},
					data:
					{
						isInstalled: false,
					},
				});

			problem.wasAutomaticallyFixed = true;
		}
	}

	if (!game.isInstalled && gameInstallations.length > 0)
	{
		const problem = problemList.addProblem("isInstalled is false but game has gameInstallations", true);

		if (autoFixProblems)
		{
			await prismaClient.game.update(
				{
					where:
					{
						id: game.id,
					},
					data:
					{
						isInstalled: true,
					},
				});

			problem.wasAutomaticallyFixed = true;
		}
	}

	//
	// Check Game Modes
	//

	// if (game.gameModes.length == 0)
	// {
	// 	problemList.addProblem("no gameModes", false);
	// }

	//
	// Check Game Platforms
	//

	if (game.gamePlatforms.length == 0)
	{
		problemList.addProblem("no gamePlatforms", false);
	}

	//
	// Check Game Play Actions
	//

	if (game.isInstalled && game.gamePlayActions.length == 0)
	{
		problemList.addProblem("game is marked as installed but has no gamePlayActions", false);
	}

	if (!game.isInstalled && game.gamePlayActions.length > 0)
	{
		problemList.addProblem("game is not marked installed but has gamePlayActions", false);
	}

	//
	// Check Game Play Sessions
	//

	let playTimeTotalSeconds = 0;

	for (const gamePlaySession of game.gamePlaySessions)
	{
		playTimeTotalSeconds += gamePlaySession.playTimeSeconds;
	}

	if (game.playTimeTotalSeconds != playTimeTotalSeconds)
	{
		const difference = game.playTimeTotalSeconds - playTimeTotalSeconds;

		problemList.addProblem("game play time is " + game.playTimeTotalSeconds + " but sum of all sessions is " + playTimeTotalSeconds + " (difference: " + difference + ")", true);
	}

	//
	// Return Problem List
	//

	return problemList;
}