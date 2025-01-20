//
// Imports
//

import { GamePlayActionType, Prisma } from "@prisma/client";
import { z } from "zod";

import { LGGL_LAUNCH_CHECK_INTERVAL } from "../../env/LGGL_LAUNCH_CHECK_INTERVAL.js";
import { LGGL_LAUNCH_INITIAL_CHECK_DELAY } from "../../env/LGGL_LAUNCH_INITIAL_CHECK_DELAY.js";
import { LGGL_LAUNCH_MAX_TRACKING_ATTEMPTS } from "../../env/LGGL_LAUNCH_MAX_TRACKING_ATTEMPTS.js";

import { prismaClient } from "../../instances/prismaClient.js";

import * as GamePlaySessionModelLib from "./GamePlaySession.js";

import * as SystemLib from "../System.js";

//
// Constants
//

const typeNames: Record<GamePlayActionType, string> =
{
	"EXECUTABLE": "Executable",
	"URL": "URL",
};

//
// Create/Find/Update/Delete Functions
//

export type ExecuteGamePlayAction = Prisma.GamePlayActionGetPayload<
	{
		include:
		{
			game: true;
		};
	}>;

export type ExecuteResult =
{
	success: true;
} |
{
	success: false;
	message: string;
};

export async function execute(gamePlayAction: ExecuteGamePlayAction): Promise<ExecuteResult>
{
	//
	// Start Process
	//

	console.log("[LauncherLib] Starting process for game %d using game play action %d...", gamePlayAction.game.id, gamePlayAction.id);

	switch (gamePlayAction.type)
	{
		case "EXECUTABLE":
		{
			const workingDirectory = gamePlayAction.workingDirectory;

			if (workingDirectory == null)
			{
				return {
					success: false,
					message: "Working directory is required for EXECUTABLE type GamePlayAction."
				};
			}

			const additionalArgumentsParseResult = z.array(z.string()).safeParse(gamePlayAction.argumentsJson);
		
			if (!additionalArgumentsParseResult.success)
			{
				return {
					success: false,
					message: "Failed to parse additional arguments for EXECUTABLE type GamePlayAction: " + additionalArgumentsParseResult.error.message,
				};
			}
		
			const additionalArguments = additionalArgumentsParseResult.data;

			await SystemLib.startExecutable(gamePlayAction.path, workingDirectory, additionalArguments);

			break;
		}

		case "URL":
		{
			await SystemLib.startUrl(gamePlayAction.path);

			break;
		}
	}


	//
	// Initial Check Delay
	//

	if (LGGL_LAUNCH_INITIAL_CHECK_DELAY > 0)
	{
		console.log("[LauncherLib] Waiting %dms for initial check...", LGGL_LAUNCH_INITIAL_CHECK_DELAY);

		await new Promise(resolve => setTimeout(resolve, LGGL_LAUNCH_INITIAL_CHECK_DELAY));
	}

	//
	// Find Game Process
	//

	for (let trackingAttempt = 1; trackingAttempt <= LGGL_LAUNCH_MAX_TRACKING_ATTEMPTS; trackingAttempt++)
	{
		console.log("[LauncherLib] Checking for game process for game %d, attempt %d...", gamePlayAction.game.id, trackingAttempt);

		const isGameProcessRunning = await SystemLib.isProcessRunning(gamePlayAction.trackingPath);

		if (isGameProcessRunning)
		{
			break;
		}

		if (trackingAttempt == LGGL_LAUNCH_MAX_TRACKING_ATTEMPTS)
		{	
			console.log("[LauncherLib] Game process not found after %d attempts!", LGGL_LAUNCH_MAX_TRACKING_ATTEMPTS);

			return {
				success: false,
				message: "Game process not found after " + LGGL_LAUNCH_MAX_TRACKING_ATTEMPTS + " attempts!",
			};
		}

		await new Promise(resolve => setTimeout(resolve, LGGL_LAUNCH_CHECK_INTERVAL));
	}

	//
	// Create Game Play Session
	//

	const gamePlaySession = await GamePlaySessionModelLib.start(gamePlayAction);

	//
	// Update Game
	//

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
				completionStatus: updateCompletionStatus ? "IN_PROGRESS" : undefined,
				firstPlayedDate: gamePlayAction.game.firstPlayedDate == null ? gamePlaySession.startDate : undefined,
				lastPlayedDate: gamePlaySession.startDate,
				playCount: { increment: 1 },
			},
		});

	//
	// Return
	//

	return {
		success: true,
	};
}

//
// Utility Functions
//

export function getTypeName(gamePlayActionOrType: Prisma.GameCompanyGetPayload<null> | GamePlayActionType)
{
	return typeof gamePlayActionOrType == "string"
		? typeNames[gamePlayActionOrType]
		: gamePlayActionOrType.type;
}