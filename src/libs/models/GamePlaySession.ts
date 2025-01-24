//
// Imports
//

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { LGGL_CURRENT_PLATFORM_ID } from "../../env/LGGL_CURRENT_PLATFORM_ID.js";

import { prismaClient } from "../../instances/prismaClient.js";

import * as SettingModelLib from "./Setting.js";

import * as SystemLib from "../System.js";

//
// Constants
//

export const gamesWithActiveSessions = new Set<number>();

//
// Create/Find/Update/Delete Functions
//

async function update(gamePlaySession: Prisma.GamePlaySessionGetPayload<{ include: { game: true } }>)
{
	const gamePlaySessionEndDateTime = DateTime.now();

	const playTimeSeconds = Math.round(gamePlaySessionEndDateTime.toSeconds() - DateTime.fromJSDate(gamePlaySession.startDate).toSeconds());

	console.log("[GamePlaySessionModelLib] Updating play session %d for game %d with %d seconds of play time...", 
		gamePlaySession.id, 
		gamePlaySession.game.id, 
		playTimeSeconds);

	return await prismaClient.$transaction(
		async (transactionClient) =>
		{
			await transactionClient.game.update(
				{
					where:
					{
						id: gamePlaySession.game_id,
					},
					data:
					{
						lastPlayedDate: gamePlaySessionEndDateTime.toJSDate(),
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
						endDate: DateTime.now().toJSDate(),
						playTimeSeconds,
					},
				});
		});
}

async function end(gamePlaySession: Prisma.GamePlaySessionGetPayload<{ include: { game: true } }>)
{
	const gamePlaySessionEndDateTime = DateTime.now();

	const playTimeSeconds = Math.round(gamePlaySessionEndDateTime.toSeconds() - DateTime.fromJSDate(gamePlaySession.startDate).toSeconds());

	console.log("[GamePlaySessionModelLib] Ending play session %d for game %d with %d seconds of play time...", 
		gamePlaySession.id, 
		gamePlaySession.game.id,
		playTimeSeconds);

	await prismaClient.$transaction(
		async (transactionClient) =>
		{
			await transactionClient.game.update(
				{
					where:
					{
						id: gamePlaySession.game.id,
					},
					data:
					{
						lastPlayedDate: gamePlaySessionEndDateTime.toJSDate(),
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
}
export async function start(gamePlayAction: Prisma.GamePlayActionGetPayload<{ include: { game: true } }>, settings: SettingModelLib.Settings)
{	
	const gamePlaySessionStartDateTime = DateTime.now();

	let gamePlaySession = await prismaClient.gamePlaySession.create(
		{
			data:
			{
				startDate: gamePlaySessionStartDateTime.toJSDate(),
				endDate: gamePlaySessionStartDateTime.toJSDate(),
				playTimeSeconds: 0,

				game_id: gamePlayAction.game.id,
				gamePlayAction_id: gamePlayAction.id,
				platform_id: LGGL_CURRENT_PLATFORM_ID,
			},
			include:
			{
				game: true,
			},
		});

	console.log("[GamePlaySessionModelLib] Started play session %d for game %d...", gamePlaySession.id, gamePlayAction.game.id);

	gamesWithActiveSessions.add(gamePlayAction.game.id);

	const timeoutCallback = async () =>
	{
		const isGameProcessRunning = await SystemLib.isProcessRunning(gamePlayAction.trackingPath);

		if (isGameProcessRunning)
		{
			update(gamePlaySession);

			setTimeout(timeoutCallback, settings.gameLauncherCheckInterval);
		}
		else
		{
			gamesWithActiveSessions.delete(gamePlayAction.game.id);

			end(gamePlaySession);
		}
	}

	setTimeout(timeoutCallback, settings.gameLauncherCheckInterval);

	return gamePlaySession;
}