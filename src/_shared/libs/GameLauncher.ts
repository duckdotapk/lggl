//
// Imports
//

import child_process from "node:child_process";

import { PlaySessionPlatform, Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { prismaClient } from "../instances/prismaClient.js";

//
// Constants
//

const initialCheckDelay = 2000;

const maxTrackingAttempts = 5;

const checkInterval = 2000;

//
// Utility Functions
//

async function startProcess(game: Prisma.GameGetPayload<null>)
{
	if (game.steamAppId == null)
	{
		throw new Error(`Game ${game.id} does not have a Steam App ID!`);
	}

	let command: string;
	let commandArguments: string[];

	switch (process.platform)
	{
		case "win32":
			command = "cmd";
			commandArguments = [ "/c", "start", "", "steam://rungameid/" + game.steamAppId ];

			break;

		// TODO: make this work on Linux
		// TODO: make this work on macOS
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

		// TODO: make this work on Linux
		// TODO: make this work on macOS
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

function determinePlatform()
{
	// TODO: detect Steam Deck, somehow

	switch (process.platform)
	{
		case "win32":
			return PlaySessionPlatform.WINDOWS;

		case "darwin":
			return PlaySessionPlatform.MAC;

		case "linux":
			return PlaySessionPlatform.LINUX;

		default:
			return PlaySessionPlatform.UNKNOWN;
	}
}

async function recordPlaySession(gameId: number, startDateTime: DateTime, endDateTime: DateTime)
{
	const playTimeSeconds = Math.round(endDateTime.toSeconds() - startDateTime.toSeconds());

	await prismaClient.$transaction(
		async (transactionClient) =>
		{
			const game = await transactionClient.game.findFirstOrThrow(
				{
					where:
					{
						id: gameId,
					},
				});
	
			await transactionClient.game.update(
				{
					where:
					{
						id: game.id,
					},
					data:
					{
						lastPlayedDate: DateTime.now().toJSDate(),
						playCount: { increment: 1 },
						playTimeTotalSeconds: { increment: playTimeSeconds },
					},
				});

			await transactionClient.playSession.create(
				{
					data:
					{
						platform: determinePlatform(),
						startDate: startDateTime.toJSDate(),
						endDate: endDateTime.toJSDate(),
						playTimeSeconds,

						game_id: game.id,
					},
				});
		});
}

export async function launchGame(game: Prisma.GameGetPayload<{ include: { installations: true } }>)
{
	console.log("[GameLauncherLib] Getting tracking path: %s", game.name);

	if (game.installations[0] == null)
	{
		throw new Error(`Game ${game.id} does not have any installations!`);
	}

	const trackingPath = game.installations[0].path;

	console.log("[GameLauncherLib] Launching game: %s", game.name);

	await startProcess(game);

	console.log("[GameLauncherLib] Game process started, using tracking path: %s", game.name);

	await new Promise(resolve => setTimeout(resolve, initialCheckDelay));

	let gameProcess: string | null = null;

	for (let i = 0; i < maxTrackingAttempts; i++)
	{
		gameProcess = await findGameProcess(trackingPath);

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

	console.log("[GameLauncherLib] Starting session at: %d", playSessionStartDateTime);

	const interval = setInterval(
		async () =>
		{
			const gameProcess = await findGameProcess(trackingPath);

			if (gameProcess != null)
			{
				return;
			}

			clearInterval(interval);

			const playSessionEndDateTime =  DateTime.now();

			console.log("[GameLauncherLib] Ending session at: %d", playSessionEndDateTime);

			await recordPlaySession(game.id, playSessionStartDateTime, playSessionEndDateTime);
		},
		checkInterval);
}