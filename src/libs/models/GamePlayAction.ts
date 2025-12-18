//
// Imports
//

import { GamePlayActionType, Prisma } from "@prisma/client";
import { DateTime } from "luxon";
import { z } from "zod";

import { LGGL_CURRENT_PLATFORM_ID } from "../../env/LGGL_CURRENT_PLATFORM_ID.js";

import { prismaClient } from "../../instances/prismaClient.js";

import { Settings } from "./Setting.js";

import
{
	findRunningProcess,
	isProcessStillRunning,
	parseProcessRequirements,
	startProcessViaExecutable,
	startProcessViaUrl,
} from "../System.js";

//
// Types
//

export type GameProcess =
{
	id: number;
	executable: string;
	commandLineArguments: string[];
	environmentVariables: Record<string, string>;
};

//
// Constants
//

export const typeNames: Record<GamePlayActionType, string> =
{
	"EXECUTABLE": "Executable",
	"URL": "URL",
};

//
// Utility Functions
//

export type ExecuteGamePlayActionResult =
{
	success: true;
} |
{
	success: false;
	error: string;
};

export async function executeGamePlayAction
(
	gamePlayAction: Prisma.GamePlayActionGetPayload<
	{
		include:
		{
			game: true;
		};
	}>,
	settings: Settings,
): Promise<string | null>
{
	//
	// Parse Process Requirements
	//

	console.log("[GamePlayActionLib] Parsing GamePlayAction processRequirements...");

	const
	[
		processRequirements,
		parseProcessRequirementsError,
	] = parseProcessRequirements(gamePlayAction.processRequirements);

	if (parseProcessRequirementsError != null)             
	{
		return parseProcessRequirementsError;
	}

	//
	// Check for Process
	//

	const alreadyRunningProcess = await findRunningProcess(
		processRequirements,
		1,
		settings.processCheckInterval,
	);

	if (alreadyRunningProcess != null)
	{
		// TODO: check if there is NOT an active session for
		// 	this game and start one instead of erroring
		return "Game process is already running.";
	}

	//
	// Start Process
	//

	console.log("[GamePlayActionLib] Starting process...");

	switch (gamePlayAction.type)
	{
		case "EXECUTABLE":
		{
			const workingDirectory = gamePlayAction.workingDirectory ?? null;

			let additionalArguments: string[] = [];

			if (gamePlayAction.additionalArguments != null)
			{
				let additionalArgumentsJson;

				try
				{
					additionalArgumentsJson = JSON.parse(gamePlayAction.additionalArguments);
				}
				catch (error)
				{
					return "GamePlayAction " + gamePlayAction.id +
						" additionalArguments is not valid JSON.";
				}

				const additionalArgumentsParseResult = z.array(z.string()).safeParse(
					additionalArgumentsJson,
				);

				if (!additionalArgumentsParseResult.success)
				{
					return "GamePlayAction " + gamePlayAction.id +
						" additionalArguments is not an array of strings.";
				}

				additionalArguments = additionalArgumentsParseResult.data;
			}

			startProcessViaExecutable(gamePlayAction.path, workingDirectory, additionalArguments);

			break;
		}

		case "URL":
		{
			startProcessViaUrl(gamePlayAction.path);

			break;
		}
	}

	//
	// Initial Process Check Delay
	//

	if (settings.initialProcessCheckDelay > 0)
	{
		console.log(
			"[GamePlayActionLib] Waiting %d ms before checking for process...",
			settings.initialProcessCheckDelay,
		);

		await new Promise(resolve => setTimeout(resolve, settings.initialProcessCheckDelay));
	}

	//
	// Find Game Process
	//

	const runningProcess = await findRunningProcess(
		processRequirements,
		settings.maxProcessCheckAttempts,
		settings.processCheckInterval,
	);

	if (runningProcess == null)
	{
		return "GamePlayAction processRequirements not met.";
	}

	//
	// Create Game Play Session
	//

	console.log("[GamePlayActionLib] Creating game play session...");
	
	const gamePlaySession = await prismaClient.gamePlaySession.create(
		{
			data:
			{
				game_id: gamePlayAction.game.id,
				gamePlayAction_id: gamePlayAction.id,
				platform_id: LGGL_CURRENT_PLATFORM_ID,
			},
		});

	//
	// Update Game
	//

	console.log("[GamePlayActionLib] Updating game...");

	const updateCompletionStatus =
		gamePlayAction.game.progressionType != "NONE" && 
		(gamePlayAction.game.completionStatus == null || gamePlayAction.game.completionStatus == "TODO");

	await prismaClient.game.update(
		{
			where:
			{
				id: gamePlayAction.game.id,
			},
			data:
			{
				completionStatus: updateCompletionStatus 
					? "IN_PROGRESS"
					: undefined,
				firstPlayedDate: gamePlayAction.game.firstPlayedDate == null 
					? gamePlaySession.startDate
					: undefined,
				lastPlayedDate: gamePlaySession.startDate,
				playCount: { increment: 1 },
			},
		});

	//
	// Start Timeout
	//

	const timeoutCallback = async () =>
	{
		const processStillRunning = await isProcessStillRunning(processRequirements, runningProcess);

		const gamePlaySessionEndDateTime = DateTime.now();

		const gamePlaySessionPlayTimeSeconds = Math.round(
			gamePlaySessionEndDateTime.toSeconds() -
			DateTime.fromJSDate(gamePlaySession.startDate).toSeconds(),
		);

		console.log(
			"[GamePlayActionLib] Updating game play session %d with %d seconds of play time...",
			gamePlaySession.id,
			gamePlaySessionPlayTimeSeconds,
		);

		await prismaClient.gamePlaySession.update(
		{
			where:
			{
				id: gamePlaySession.id,
			},
			data:
			{
				endDate: gamePlaySessionEndDateTime.toJSDate(),
				playTimeSeconds: gamePlaySessionPlayTimeSeconds,
				addedToTotal: !processStillRunning,
			},
		});

		if (processStillRunning)
		{
			setTimeout(timeoutCallback, settings.processCheckInterval);

			return;
		}

		console.log(
			"[GamePlayActionLib] Game process is no longer running. Updating game play time...",
		);
		
		await prismaClient.game.update(
		{
			where:
			{
				id: gamePlaySession.game_id,
			},
			data:
			{
				lastPlayedDate: gamePlaySessionEndDateTime.toJSDate(),
				playTimeTotalSeconds: { increment: gamePlaySessionPlayTimeSeconds },
			},
		});
	}

	setTimeout(timeoutCallback, settings.processCheckInterval);

	//
	// Return
	//

	return null;
}