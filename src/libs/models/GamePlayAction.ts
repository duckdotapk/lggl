//
// Imports
//

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { LGGL_LAUNCH_CHECK_INTERVAL } from "../../env/LGGL_LAUNCH_CHECK_INTERVAL.js";
import { LGGL_LAUNCH_INITIAL_CHECK_DELAY } from "../../env/LGGL_LAUNCH_INITIAL_CHECK_DELAY.js";
import { LGGL_LAUNCH_MAX_TRACKING_ATTEMPTS } from "../../env/LGGL_LAUNCH_MAX_TRACKING_ATTEMPTS.js";

import { prismaClient } from "../../instances/prismaClient.js";

import * as GamePlaySessionModelLib from "./GamePlaySession.js";

import * as GameSchemaLib from "../schemas/Game.js";
import * as GamePlayActionSchemaLib from "../schemas/GamePlayAction.js";

import * as SystemLib from "../System.js";

//
// Constants
//

const typeNames: Record<GamePlayActionSchemaLib.Type, string> =
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
	// Parse Additional Arguments
	//

	console.log("[LauncherLib] Parsing additional arguments for game play action %d...", gamePlayAction.id);

	const additionalArgumentsParseResult = z.array(z.string()).safeParse(JSON.parse(gamePlayAction.argumentsJson));

	if (!additionalArgumentsParseResult.success)
	{
		return {
			success: false,
			message: "Failed to parse additional arguments for game play action " + gamePlayAction.id + ": " + additionalArgumentsParseResult.error.message,
		};
	}

	const additionalArguments = additionalArgumentsParseResult.data;

	//
	// Start Process
	//

	console.log("[LauncherLib] Starting process for game %d using game play action %d...", gamePlayAction.game.id, gamePlayAction.id);

	await SystemLib.startProcess(gamePlayAction.path, additionalArguments);

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
		gamePlayAction.game.progressionType != "NONE" satisfies GameSchemaLib.ProgressionType && 
		(gamePlayAction.game.completionStatus == null || gamePlayAction.game.completionStatus == "TODO" satisfies GameSchemaLib.CompletionStatus);

	await prismaClient.game.update(
		{
			where:
			{
				id: gamePlayAction.game.id,
			},
			data:
			{
				completionStatus: updateCompletionStatus ? "IN_PROGRESS" satisfies GameSchemaLib.CompletionStatus : undefined,
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

export function getTypeName(gamePlayActionOrType: Prisma.GameCompanyGetPayload<null> | GamePlayActionSchemaLib.Type)
{
	if (typeof gamePlayActionOrType == "string")
	{
		return typeNames[gamePlayActionOrType];
	}

	if (gamePlayActionOrType.type == null)
	{
		return "-";
	}

	const typeParseResult = GamePlayActionSchemaLib.TypeSchema.safeParse(gamePlayActionOrType.type);

	return typeParseResult.success
		? typeNames[typeParseResult.data]
		: "Invalid: " + gamePlayActionOrType.type;
}