//
// Imports
//

import child_process from "node:child_process";

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { prismaClient } from "../instances/prismaClient.js";

//
// Constants
//

const maxTrackingAttempts = 5;

const initialCheckDelay = 5000;

const checkInterval = 5000;

//
// Utility Functions
//

async function startProcess(gameId: number, trackingPath: string | null, steamApp: string | null)
{
	if (trackingPath == null)
	{
		throw new Error(`Game ${gameId} does not have a tracking path!`);
	}

	if (steamApp == null)
	{
		throw new Error(`Game ${gameId} does not have a Steam App ID!`);
	}

	let command: string;
	let commandArguments: string[];

	switch (process.platform)
	{
		case "win32":
			command = "cmd";
			commandArguments = [ "/c", "start", "", "steam://rungameid/" + steamApp ];

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

	return {
		trackingPath,
		steamApp,
	};
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

	const gameProcess = processes.find(process => process.startsWith(trackingPath));

	return gameProcess;
}

async function recordPlaySession(gameId: number, startTimestamp: number, endTimestamp: number)
{
	const playTime = Math.round(endTimestamp - startTimestamp);

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
						playCount: { increment: 1 },
						playTime: { increment: playTime },
					},
				});

			await transactionClient.playSession.create(
				{
					data:
					{
						startTimestamp,
						endTimestamp,
						platform: process.platform,
						playTime,

						game_id: game.id,
					},
				});
		});
}

export async function launchGame(game: Prisma.GameGetPayload<null>)
{
	console.log("[GameLauncherLib] Launching game: %s", game.name);

	const { trackingPath } = await startProcess(game.id, game.trackingPath, game.steamApp);

	console.log("[GameLauncherLib] Game process started, using tracking path: %s", game.name);

	await new Promise(resolve => setTimeout(resolve, initialCheckDelay));

	// TODO: this is fucking stupid and wrong idiot, it should return if the process is never found
	for (let i = 0; i < maxTrackingAttempts; i++)
	{
		const gameProcess = await findGameProcess(trackingPath);

		if (gameProcess == null)
		{
			console.log("[GameLauncherLib] Game process not found, retrying %d more times...", maxTrackingAttempts - i);

			await new Promise(resolve => setTimeout(resolve, checkInterval));

			continue;
		}

		console.log("[GameLauncherLib] Game process found: %s", gameProcess);

		break;
	}

	const playSessionStartTimestamp = DateTime.utc().toSeconds();

	console.log("[GameLauncherLib] Starting session at: %d", playSessionStartTimestamp);

	const interval = setInterval(
		async () =>
		{
			const gameProcess = await findGameProcess(trackingPath);

			if (gameProcess != null)
			{
				return;
			}

			clearInterval(interval);

			const playSessionEndTimestamp = DateTime.utc().toSeconds();

			console.log("[GameLauncherLib] Ending session at: %d", playSessionEndTimestamp);

			await recordPlaySession(game.id, playSessionStartTimestamp, playSessionEndTimestamp);
		},
		checkInterval);
}