//
// Imports
//

import child_process from "node:child_process";

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { prismaClient } from "../instances/prismaClient.js";

import { configuration } from "./Configuration.js";

//
// Constants
//

const initialCheckDelay = 2000;

const maxTrackingAttempts = 5;

const checkInterval = 2000;

//
// Utility Functions
//

async function startProcess(gamePlayAction: Prisma.GamePlayActionGetPayload<null>)
{
	// TODO: will this work with EXECUTABLE type GamePlayActions?

	let command: string;
	let commandArguments: string[];

	switch (process.platform)
	{
		case "win32":
			command = "cmd";
			commandArguments = [ "/c", "start", "", gamePlayAction.path ];

			break;

		// TODO: make this work on macOS
		// TODO: make this work on Linux
		default:
			throw new Error("Unsupported platform: " + process.platform);
	}

	const child = child_process.spawn(command, commandArguments,
		{
			detached: true,
			stdio: "ignore",
		});

	child.unref();
}

async function getRunningProcesses()
{
	let command: string;

	switch (process.platform)
	{
		case "win32":
			command = "wmic process get ExecutablePath";

			break;

		// TODO: make this work on macOS
		// TODO: make this work on Linux
		default:
			throw new Error("Unsupported platform: " + process.platform);
	}

    return new Promise<string[]>( 
		(resolve, reject) => 
		{
			child_process.exec(command, 
				(error, stdout) => 
				{
					if (error) 
					{
						return reject(error);
					}

					const processes = stdout.split("\n").map(line => line.trim()).filter(line => line.length > 0);

					resolve(processes);
				});
		});
}

async function findGameProcess(trackingPath: string)
{
	const processes = await getRunningProcesses();

	return processes.find(process => process.startsWith(trackingPath)) ?? null;
}

export async function launchGame(game: Prisma.GameGetPayload<null>, gamePlayAction: Prisma.GamePlayActionGetPayload<null>)
{
	console.log("[GameLauncherLib] Starting process for game: %s (%d)", game.name, game.id);

	await startProcess(gamePlayAction);

	console.log("[GameLauncherLib] Process started, using game play action %d tracking path: %s", gamePlayAction.id, gamePlayAction.trackingPath);

	await new Promise(resolve => setTimeout(resolve, initialCheckDelay));

	let gameProcess: string | null = null;

	for (let i = 0; i < maxTrackingAttempts; i++)
	{
		gameProcess = await findGameProcess(gamePlayAction.trackingPath);

		if (gameProcess == null)
		{
			console.log("[GameLauncherLib] Game process not found, retrying %d more times...", maxTrackingAttempts - i);

			await new Promise(resolve => setTimeout(resolve, checkInterval));

			continue;
		}

		console.log("[GameLauncherLib] Game process found: %s", gameProcess);

		break;
	}

	if (gameProcess == null)
	{
		throw new Error("Game process not found after " + maxTrackingAttempts + " attempts!");
	}

	const playSessionStartDateTime = DateTime.now();

	await prismaClient.game.update(
		{
			where:
			{
				id: game.id,
			},
			data:
			{
				completionStatus: game.progressionType != "NONE" ? "IN_PROGRESS" : undefined,
				firstPlayedDate: game.firstPlayedDate == null ? playSessionStartDateTime.toJSDate() : undefined,
				lastPlayedDate: playSessionStartDateTime.toJSDate(),
			},
		});

	const gamePlayActionSession = await prismaClient.gamePlayActionSession.create(
		{
			data:
			{
				startDate: playSessionStartDateTime.toJSDate(),
				endDate: playSessionStartDateTime.toJSDate(),
				playTimeSeconds: 0,

				gamePlayAction_id: gamePlayAction.id,
				platform_id: configuration.platformId,
			},
		});

	console.log("[GameLauncherLib] Starting session at: %d", playSessionStartDateTime);

	const interval = setInterval(
		async () =>
		{
			const playSessionEndDateTime =  DateTime.now();

			const playTimeSeconds = Math.round(playSessionEndDateTime.toSeconds() - playSessionStartDateTime.toSeconds());

			const gameProcess = await findGameProcess(gamePlayAction.trackingPath);

			if (gameProcess != null)
			{
				console.log("[GameLauncherLib] Updating game play action session %d with play time: %d", gamePlayAction.id, playTimeSeconds);

				await prismaClient.gamePlayActionSession.update(
					{
						where:
						{
							id: gamePlayActionSession.id,
						},
						data:
						{
							endDate: DateTime.now().toJSDate(),
							playTimeSeconds,
						},
					});
			}
			else
			{

				console.log("[GameLauncherLib] Ending session at: %d", playSessionEndDateTime);
				
				clearInterval(interval);

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
									lastPlayedDate: playSessionEndDateTime.toJSDate(),
									playCount: { increment: 1 },
									playTimeTotalSeconds: { increment: playTimeSeconds },
								},
							});

						await transactionClient.gamePlayActionSession.update(
							{
								where:
								{
									id: gamePlayActionSession.id,
								},
								data:
								{
									endDate: playSessionEndDateTime.toJSDate(),
									playTimeSeconds,
									addedToTotal: true,
								},
							});
					});
			}
		},
		checkInterval);
}