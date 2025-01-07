//
// Imports
//

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";
import { z } from "zod";

import { LGGL_CURRENT_PLATFORM_ID } from "../env/LGGL_CURRENT_PLATFORM_ID.js";
import { LGGL_LAUNCH_CHECK_INTERVAL } from "../env/LGGL_LAUNCH_CHECK_INTERVAL.js";
import { LGGL_LAUNCH_INITIAL_CHECK_DELAY } from "../env/LGGL_LAUNCH_INITIAL_CHECK_DELAY.js";
import { LGGL_LAUNCH_MAX_TRACKING_ATTEMPTS } from "../env/LGGL_LAUNCH_MAX_TRACKING_ATTEMPTS.js";

import { prismaClient } from "../instances/prismaClient.js";

import * as GameSchemaLib from "../libs/schemas/Game.js";

import * as SystemLib from "./System.js";

//
// Utility Functions
//

export type LaunchGameResult =
{
	success: true;
} |
{
	success: false;
	message: string;
};

export async function launchGame(game: Prisma.GameGetPayload<null>, gamePlayAction: Prisma.GamePlayActionGetPayload<null>): Promise<LaunchGameResult>
{
	//
	// Parse Additional Arguments
	//

	console.log("[LauncherLib] Parsing additional arguments for game play action %d...", gamePlayAction.id);

	const additionalArgumentsParseResult = z.array(z.string()).safeParse(gamePlayAction.argumentsJson);

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

	console.log("[LauncherLib] Starting process for %s using game play action %d...", game.name, gamePlayAction.id);

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
		const isGameProcessRunning = await SystemLib.isProcessRunning(gamePlayAction.trackingPath);

		if (isGameProcessRunning)
		{
			break;
		}

		if (trackingAttempt == LGGL_LAUNCH_MAX_TRACKING_ATTEMPTS)
		{
			return {
				success: false,
				message: "Game process not found after " + LGGL_LAUNCH_MAX_TRACKING_ATTEMPTS + " attempts!",
			};
		}

		await new Promise(resolve => setTimeout(resolve, LGGL_LAUNCH_CHECK_INTERVAL));
	}

	//
	// Get Current Time
	//

	const gamePlaySessionStartDateTime = DateTime.now();

	//
	// Update Game
	//

	await prismaClient.game.update(
		{
			where:
			{
				id: game.id,
			},
			data:
			{
				completionStatus: game.completionStatus == null || game.completionStatus == ("TODO" satisfies GameSchemaLib.CompletionStatus)
					? "IN_PROGRESS" satisfies GameSchemaLib.CompletionStatus
					: undefined,
				firstPlayedDate: game.firstPlayedDate == null
					? gamePlaySessionStartDateTime.toJSDate()
					: undefined,
				lastPlayedDate: gamePlaySessionStartDateTime.toJSDate(),
			},
		});

	//
	// Create Game Play Session
	//

	console.log("[LauncherLib] Creating game play session for %s starting at %s...", game.name, gamePlaySessionStartDateTime.toISO());

	const gamePlaySession = await prismaClient.gamePlaySession.create(
		{
			data:
			{
				startDate: gamePlaySessionStartDateTime.toJSDate(),
				endDate: gamePlaySessionStartDateTime.toJSDate(),
				playTimeSeconds: 0,

				game_id: game.id,
				gamePlayAction_id: gamePlayAction.id,
				platform_id: LGGL_CURRENT_PLATFORM_ID,
			},
		});

	//
	// Set Interval
	//
	
	const interval = setInterval(
		async () =>
		{
			const gamePlaySessionEndDateTime = DateTime.now();

			const playTimeSeconds = Math.round(gamePlaySessionEndDateTime.toSeconds() - gamePlaySessionStartDateTime.toSeconds());

			const isGameProcessRunning = await SystemLib.isProcessRunning(gamePlayAction.trackingPath);

			if (isGameProcessRunning)
			{
				console.log("[LauncherLib] Updating game play action session %d with play time: %d", gamePlayAction.id, playTimeSeconds);

				await prismaClient.gamePlaySession.update(
					{
						where:
						{
							id: gamePlaySession.id,
						},
						data:
						{
							endDate: DateTime.now().toJSDate(),
							playTimeSeconds,
						},
					});

				return;
			}
			
			clearInterval(interval);

			console.log("[LauncherLib] Game process not found, ending session for %s at %s...", game.name, gamePlaySessionEndDateTime.toISO());

			await prismaClient.$transaction(
				async (transactionClient) =>
				{
					await transactionClient.game.update(
						{
							where:
							{
								id: game.id,
							},
							data:
							{
								lastPlayedDate: gamePlaySessionEndDateTime.toJSDate(),
								playCount: { increment: 1 },
								playTimeTotalSeconds: { increment: playTimeSeconds },
							},
						});

					await transactionClient.gamePlaySession.update(
						{
							where:
							{
								id: gamePlaySession.id,
							},
							data:
							{
								endDate: gamePlaySessionEndDateTime.toJSDate(),
								playTimeSeconds,
								addedToTotal: true,
							},
						});
				});
		},
		LGGL_LAUNCH_CHECK_INTERVAL);

	//
	// Return
	//

	return {
		success: true,
	};
}