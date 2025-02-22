//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";
import { DateTime } from "luxon";

import { LGGL_PLATFORM_ID_LINUX } from "../../../env/LGGL_PLATFORM_ID_LINUX.js";
import { LGGL_PLATFORM_ID_MAC } from "../../../env/LGGL_PLATFORM_ID_MAC.js";
import { LGGL_PLATFORM_ID_STEAM_DECK } from "../../../env/LGGL_PLATFORM_ID_STEAM_DECK.js";
import { LGGL_PLATFORM_ID_UNKNOWN } from "../../../env/LGGL_PLATFORM_ID_UNKNOWN.js";
import { LGGL_PLATFORM_ID_WINDOWS } from "../../../env/LGGL_PLATFORM_ID_WINDOWS.js";
import { LGGL_STEAM_API_KEY } from "../../../env/LGGL_STEAM_API_KEY.js";

import { prismaClient } from "../../../instances/prismaClient.js";
import { ServerFritterContext } from "../../../instances/server.js";

import * as SteamThirdPartyLib from "../../../libs/third-party/Steam.js";

import * as Schemas from "./syncHistoricalPlaytime.schemas.js";

//
// Locals
//

async function createHistoricalGamePlaySession(game_id: number, platform_id: number, playTimeSeconds: number)
{
	if (playTimeSeconds <= 0)
	{
		return;
	}

	const gamePlaySessions = await prismaClient.gamePlaySession.findMany(
		{
			where:
			{
				isHistorical: false,

				game_id,
				platform_id,
			},
		});

	const nonHistoricalPlayTimeSeconds = gamePlaySessions.reduce((accumulator, gamePlaySession) => accumulator + gamePlaySession.playTimeSeconds, 0);

	const historicalPlayTimeSeconds = playTimeSeconds - nonHistoricalPlayTimeSeconds;

	if (historicalPlayTimeSeconds <= 0)
	{
		return;
	}

	await prismaClient.gamePlaySession.create(
		{
			data:
			{
				startDate: DateTime.fromSeconds(0).toJSDate(),
				endDate: DateTime.fromSeconds(playTimeSeconds).toJSDate(),
				playTimeSeconds: historicalPlayTimeSeconds,
				addedToTotal: true,
				isHistorical: true,
				notes: "Historical play time from Steam.",

				game_id,
				platform_id,
			},
		});
}

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route = FritterApiUtilities.createEndpointRoute<RouteFritterContext, typeof Schemas.RequestBodySchema, typeof Schemas.ResponseBodySchema>(
	{
		method: Schemas.method,
		path: Schemas.path,
		middlewares: [],
		requestBodySchema: Schemas.RequestBodySchema,
		responseBodySchema: Schemas.ResponseBodySchema,
		handler: async (requestBody) =>
		{
			const game = await prismaClient.game.findUnique(
				{
					where:
					{
						id: requestBody.id,
					},
				});

			if (game == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Game not found." });
			}

			switch (requestBody.provider.name)
			{
				case "steam":
				{
					await prismaClient.gamePlaySession.deleteMany(
						{
							where:
							{
								isHistorical: true,
								notes: "Historical play time from Steam.",

								game_id: game.id,
							},
						});

					const clientLastPlayedTimes = await SteamThirdPartyLib.callPlayServiceClientGetLastPlayedTimesV1(LGGL_STEAM_API_KEY);

					const steamPlayedGame = clientLastPlayedTimes.games.find((steamPlayedGame) => steamPlayedGame.appid == game.steamAppId);
			
					if (steamPlayedGame != null)
					{
						if (requestBody.provider.updateFirstPlayedDate)
						{
							await prismaClient.game.update(
								{
									where:
									{
										id: game.id,
									},
									data:
									{
										firstPlayedDate: DateTime.fromSeconds(steamPlayedGame.first_playtime).toJSDate(),
										firstPlayedDateApproximated: false,
									},
								});
						}
	
						if (requestBody.provider.updateLastPlayedDate)
						{
							await prismaClient.game.update(
								{
									where:
									{
										id: game.id,
									},
									data:
									{
										lastPlayedDate: DateTime.fromSeconds(steamPlayedGame.last_playtime).toJSDate(),
									},
								});
						}
			
						const windowsPlayTimeSeconds = steamPlayedGame.playtime_windows_forever * 60;
	
						const macPlayTimeSeconds = steamPlayedGame.playtime_mac_forever * 60;
	
						// Note: Steam Deck counts as both Linux and Steam Deck
						const linuxPlayTimeSeconds = (steamPlayedGame.playtime_linux_forever - steamPlayedGame.playtime_deck_forever) * 60;
	
						const steamDeckPlayTimeSeconds = steamPlayedGame.playtime_deck_forever * 60;
	
						// Note: playtime_disconnected is not counted in playtime_forever
						const unknownPlayTimeSeconds =
						(
							(
								steamPlayedGame.playtime_forever -
								steamPlayedGame.playtime_windows_forever -
								steamPlayedGame.playtime_mac_forever -
								steamPlayedGame.playtime_linux_forever
							) +
							steamPlayedGame.playtime_disconnected
						) * 60;
	
						await createHistoricalGamePlaySession(game.id, LGGL_PLATFORM_ID_WINDOWS, windowsPlayTimeSeconds);
	
						await createHistoricalGamePlaySession(game.id, LGGL_PLATFORM_ID_MAC, macPlayTimeSeconds);
	
						await createHistoricalGamePlaySession(game.id, LGGL_PLATFORM_ID_LINUX, linuxPlayTimeSeconds);
	
						await createHistoricalGamePlaySession(game.id, LGGL_PLATFORM_ID_STEAM_DECK, steamDeckPlayTimeSeconds);
	
						await createHistoricalGamePlaySession(game.id, LGGL_PLATFORM_ID_UNKNOWN, unknownPlayTimeSeconds);
					}
					
					break;
				}
			}

			const gamePlaySessions = await prismaClient.gamePlaySession.findMany(
				{
					where:
					{
						game_id: game.id,
					}
				});

			const playTimeTotalSeconds = gamePlaySessions.reduce((accumulator, gamePlaySession) => accumulator + gamePlaySession.playTimeSeconds, 0);

			await prismaClient.game.update(
				{
					where:
					{
						id: game.id,
					},
					data:
					{
						playTimeTotalSeconds,
					},
				});

			return {
				success: true,
			};
		},
	});