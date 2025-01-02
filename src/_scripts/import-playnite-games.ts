//
// Imports
//

import "source-map-support/register.js";

import fs from "node:fs";

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { prismaClient } from "../_shared/instances/prismaClient.js";

import * as AntiCheatModelLib from "../_shared/libs/models/AntiCheat.js";
import * as CompanyModelLib from "../_shared/libs/models/Company.js";
import * as DrmModelLib from "../_shared/libs/models/Drm.js";
import * as EngineModelLib from "../_shared/libs/models/Engine.js";
import * as GenreModelLib from "../_shared/libs/models/Genre.js";
import * as PlatformModelLib from "../_shared/libs/models/Platform.js";
import * as SeriesModelLib from "../_shared/libs/models/Series.js";
import * as SourceModelLib from "../_shared/libs/models/Source.js";

import * as PlayniteThirdPartyLib from "../_shared/libs/third-party/Playnite.js";
import * as SteamThirdPartyLib from "../_shared/libs/third-party/Steam.js";

import {
	ACHIEVEMENT_SUPPORT as GameAchievementSupport,
	COMPLETION_STATUS as GameCompletionStatus,
	CONTROLLER_SUPPORT as GameControllerSupport,
	PROGRESSION_TYPE as GameProgressionType,
	VIRTUAL_REALITY_SUPPORT as GameVirtualRealitySupport,
} from "../_shared/libs/models/Game.js";
import { TYPE as GamePlayActionType } from "../_shared/libs/models/GamePlayAction.js";

import * as FileSizeLib from "../_shared/libs/FileSize.js";

//
// Functions
//

function determineIsEarlyAccess(playniteGame: PlayniteThirdPartyLib.PlayniteGame)
{
	return playniteGame.Tags.find((tag) => tag.Name == "Early Access") != null;
}

function determineIsShelved(playniteGame: PlayniteThirdPartyLib.PlayniteGame)
{
	return playniteGame.CompletionStatus.Name == "Shelved";
}

function determineProgressionType(playniteGame: PlayniteThirdPartyLib.PlayniteGame)
{
	switch (playniteGame.Name)
	{
		case "Bloons TD 5":
		case "PLAYERUNKNOWN'S BATTLEGROUNDS":
		case "Risk of Rain":
		case "Satisfactory":
		case "The Binding of Isaac":
			return GameProgressionType.NON_CAMPAIGN;

		case "Accounting+":
		case "Arizona Sunshine":
		case "Cyberpunk 2077":
		case "Marvel's Spider-Man":
		case "SWELTER":
		case "System Shock":
			return GameProgressionType.CAMPAIGN;
	}

	if (playniteGame.CompletionStatus.Name.startsWith("-"))
	{
		return GameProgressionType.NONE;
	}

	if (playniteGame.CompletionStatus.Name.startsWith("Other"))
	{
		return GameProgressionType.NON_CAMPAIGN;
	}

	if (playniteGame.CompletionStatus.Name.startsWith("Campaign"))
	{
		return GameProgressionType.CAMPAIGN;
	}
	
	return null;
}

function determineCompletionStatus(playniteGame: PlayniteThirdPartyLib.PlayniteGame)
{
	switch (playniteGame.CompletionStatus.Name)
	{
		case "Campaign > TODO":
		case "Other > TODO":
			return GameCompletionStatus.TODO;

		case "Campaign > In Progress":
		case "Other > In Progress":
		case "Shelved":
			return GameCompletionStatus.IN_PROGRESS;

		case "Campaign > Complete":
		case "Other > Complete":
			return GameCompletionStatus.COMPLETE

		case "Campaign > 100%":
		case "Other > 100%":
			return GameCompletionStatus.ONE_HUNDRED_PERCENT;

		default:
			return null;
	}
}

function determineFirstPlayedDate(playniteGame: PlayniteThirdPartyLib.PlayniteGame): [ Date | null, boolean ]
{
	switch (playniteGame.Name)
	{
		case "Metaphor: ReFantazio":
			return [ DateTime.fromObject({ year: 2021, month: 12, day: 29 }).toJSDate(), false ];

		case "FOREWARNED":
			return [ DateTime.fromObject({ year: 2024, month: 12, day: 20 }).toJSDate(), false ];
	}

	const yearFirstPlayedCategory = playniteGame.Categories?.find((category) => category.Name.startsWith("Year First Played > "));

	if (yearFirstPlayedCategory == null)
	{
		return [ null, false ];
	}

	const yearString = yearFirstPlayedCategory.Name.split(" > ")[1]!;

	if (yearString == "???")
	{
		return [ DateTime.fromSeconds(0).toJSDate(), true ];
	}

	const year = parseInt(yearString);

	if (isNaN(year))
	{
		throw new Error("Could not parse year from Year First Played category: " + yearFirstPlayedCategory.Name);
	}

	return [ DateTime.fromObject({ year, month: 1, day: 1 }).toJSDate(), true ];
}

function determineFirstCompletedDate(playniteGame: PlayniteThirdPartyLib.PlayniteGame)
{
	const yearFirstCompletedCategory = playniteGame.Categories?.find((category) => category.Name.startsWith("Year First Completed > "));

	if (yearFirstCompletedCategory == null)
	{
		return null;
	}

	const yearString = yearFirstCompletedCategory.Name.split(" > ")[1]!;

	if (yearString == "???")
	{
		return DateTime.fromSeconds(0).toJSDate();
	}

	const year = parseInt(yearString);

	if (isNaN(year))
	{
		throw new Error("Could not parse year from Year First Completed category: " + yearFirstCompletedCategory.Name);
	}

	return DateTime.fromObject({ year, month: 1, day: 1 }).toJSDate();
}

function determineAchievementSupport(playniteGame: PlayniteThirdPartyLib.PlayniteGame)
{
	return playniteGame.Features.find((feature) => feature.Name == "Achievements")
		? GameAchievementSupport.LAUNCHER
		: GameAchievementSupport.NONE;
}

function determineControllerSupport(playniteGame: PlayniteThirdPartyLib.PlayniteGame)
{
	if (playniteGame.Features.find((feature) => feature.Name == "Controller > Required") != null)
	{
		return GameControllerSupport.REQUIRED;
	}

	if (playniteGame.Features.find((feature) => feature.Name == "Controller > Optional") != null)
	{
		return GameControllerSupport.SUPPORTED;
	}

	if (playniteGame.Features.find((feature) => feature.Name == "Controller > Unsupported") != null)
	{
		return GameControllerSupport.NONE;
	}

	return null;
}

function determineVirtualRealitySupport(playniteGame: PlayniteThirdPartyLib.PlayniteGame)
{
	if (playniteGame.Features.find((feature) => feature.Name == "VR > Required") != null)
	{
		return GameVirtualRealitySupport.REQUIRED;
	}

	if (playniteGame.Features.find((feature) => feature.Name == "VR > Optional") != null)
	{
		return GameVirtualRealitySupport.SUPPORTED;
	}

	return GameVirtualRealitySupport.NONE;
}

function determineSteamAppId(playniteGame: PlayniteThirdPartyLib.PlayniteGame)
{
	const launchViaSteamGameAction = playniteGame.GameActions.find((gameAction) => gameAction.Name == "Launch via Steam");

	if (launchViaSteamGameAction == null)
	{
		throw new Error("Could not find Launch via Steam GameAction for game: " + playniteGame.Name);
	}

	const steamRunUrl = new URL(launchViaSteamGameAction.Path);

	const steamRunUrlComponents = steamRunUrl.pathname.split("/");

	const steamAppId = parseInt(steamRunUrlComponents[1] ?? "");

	if (isNaN(steamAppId))
	{
		throw new Error("Could not parse Steam App ID from URL: " + launchViaSteamGameAction.Path);
	}

	return steamAppId.toString();
}

async function createGamePlayAction(transactionClient: Prisma.TransactionClient, playniteGame: PlayniteThirdPartyLib.PlayniteGame, game: Prisma.GameGetPayload<null>)
{
	if (game.steamAppId == null)
	{
		throw new Error("Game does not have a Steam App ID: " + playniteGame.Name);
	}

	const launchViaSteamGameAction = playniteGame.GameActions.find((gameAction) => gameAction.Name == "Launch via Steam");

	if (launchViaSteamGameAction == null)
	{
		throw new Error("Could not find Launch via Steam GameAction for game: " + playniteGame.Name);
	}

	if (launchViaSteamGameAction.TrackingPath == null)
	{
		throw new Error("Launch via Steam GameAction does not have a TrackingPath: " + playniteGame.Name);
	}

	const gamePlayAction = await transactionClient.gamePlayAction.create(
		{
			data:
			{
				name: "Launch via Steam",
				type: GamePlayActionType.URL,
				path: launchViaSteamGameAction.Path,
				trackingPath: launchViaSteamGameAction.TrackingPath,

				game_id: game.id,
			},
		});

	const appDetails = await SteamThirdPartyLib.fetchOwnedApp(game.steamAppId);

	if (appDetails == null || appDetails.playtime_windows_forever == 0 && appDetails.playtime_mac_forever == 0 && appDetails.playtime_linux_forever == 0 && appDetails.playtime_deck_forever == 0)
	{

	}
	else
	{
		if (appDetails.playtime_windows_forever > 0)
		{
			await transactionClient.gamePlayActionSession.create(
				{
					data:
					{
						startDate: DateTime.fromSeconds(0).toJSDate(),
						endDate: DateTime.fromSeconds(appDetails.playtime_windows_forever).toJSDate(),
						playTimeSeconds: appDetails.playtime_windows_forever,
						addedToTotal: true,
						isHistorical: false,
						notes: "Historical playtime from Steam.",

						gamePlayAction_id: gamePlayAction.id,
						platform_id: 1,
					},
				});
		}

		if (appDetails.playtime_mac_forever > 0)
		{
			await transactionClient.gamePlayActionSession.create(
				{
					data:
					{
						startDate: DateTime.fromSeconds(0).toJSDate(),
						endDate: DateTime.fromSeconds(appDetails.playtime_mac_forever).toJSDate(),
						playTimeSeconds: appDetails.playtime_mac_forever,
						addedToTotal: true,
						isHistorical: false,
						notes: "Historical playtime from Steam.",

						gamePlayAction_id: gamePlayAction.id,
						platform_id: 6,
					},
				});
		}

		const nonSteamDeckLinuxPlaytime = appDetails.playtime_linux_forever - appDetails.playtime_deck_forever;

		if (nonSteamDeckLinuxPlaytime > 0)
		{
			await transactionClient.gamePlayActionSession.create(
				{
					data:
					{
						startDate: DateTime.fromSeconds(0).toJSDate(),
						endDate: DateTime.fromSeconds(nonSteamDeckLinuxPlaytime).toJSDate(),
						playTimeSeconds: nonSteamDeckLinuxPlaytime,
						addedToTotal: true,
						isHistorical: false,
						notes: "Historical playtime from Steam.",

						gamePlayAction_id: gamePlayAction.id,
						platform_id: 7,
					},
				});
		}

		if (appDetails.playtime_deck_forever > 0)
		{
			await transactionClient.gamePlayActionSession.create(
				{
					data:
					{
						startDate: DateTime.fromSeconds(0).toJSDate(),
						endDate: DateTime.fromSeconds(appDetails.playtime_deck_forever).toJSDate(),
						playTimeSeconds: appDetails.playtime_deck_forever,
						addedToTotal: true,
						isHistorical: false,
						notes: "Historical playtime from Steam.",

						gamePlayAction_id: gamePlayAction.id,
						platform_id: 8,
					},
				});
		}
	}
}

async function createGameAntiCheats(transactionClient: Prisma.TransactionClient, playniteGame: PlayniteThirdPartyLib.PlayniteGame, game: Prisma.GameGetPayload<null>)
{
	for (const playniteTag of playniteGame.Tags)
	{
		let antiCheat: Prisma.AntiCheatGetPayload<null>;

		switch (playniteTag.Name)
		{
			case "Dependency > BattlEye":
				antiCheat = await AntiCheatModelLib.findOrCreateByName(transactionClient, "BattlEye");

				break;

			case "Dependency > Easy Anti Cheat":
				antiCheat = await AntiCheatModelLib.findOrCreateByName(transactionClient, "Easy Anti-Cheat");

				break;

			default:
				continue;
		}

		await transactionClient.gameAntiCheat.create(
			{
				data:
				{
					antiCheat_id: antiCheat.id,
					game_id: game.id,
				},
			});
	}
}

async function createGameDevelopers(transactionClient: Prisma.TransactionClient, playniteGame: PlayniteThirdPartyLib.PlayniteGame, game: Prisma.GameGetPayload<null>)
{
	for (const playniteCompany of playniteGame.Developers)
	{
		const company = await CompanyModelLib.findOrCreateByName(transactionClient, playniteCompany.Name);

		await transactionClient.gameDeveloper.create(
			{
				data:
				{
					company_id: company.id,
					game_id: game.id,
				},
			});
	}
}

async function createGameDrms(transactionClient: Prisma.TransactionClient, playniteGame: PlayniteThirdPartyLib.PlayniteGame, game: Prisma.GameGetPayload<null>)
{
	for (const playniteTag of playniteGame.Tags)
	{
		let drm: Prisma.DrmGetPayload<null>;

		switch (playniteTag.Name)
		{
			case "Dependency > Denuvo Anti-tamper":
				drm = await DrmModelLib.findOrCreateByName(transactionClient, "Denuvo Anti-tamper");

				break;

			default:
				continue;
		}

		await transactionClient.gameDrm.create(
			{
				data:
				{
					drm_id: drm.id,
					game_id: game.id,
				},
			});
	}
}

const engineNameMap: Record<string, string> =
{
	"Dark Engine": "Engine",
	"Kex Engine": "KEX",
	"Miscellaneous": "Unknown",
	"Unreal Engine": "Unreal",
};

async function createGameEngines(transactionClient: Prisma.TransactionClient, playniteGame: PlayniteThirdPartyLib.PlayniteGame, game: Prisma.GameGetPayload<null>)
{
	for (const playniteTag of playniteGame.Tags)
	{
		if (!playniteTag.Name.startsWith("Engine > "))
		{
			continue;
		}

		let engineName = playniteTag.Name.split(" > ")[1]!;

		engineName = engineNameMap[engineName] ?? engineName;

		const engine = await EngineModelLib.findOrCreateByName(transactionClient, engineName);

		await transactionClient.gameEngine.create(
			{
				data:
				{
					engine_id: engine.id,
					game_id: game.id,
				},
			});
	}
}

const genreNameMap: Record<string, string> =
{
	"2D Platformer": "Platformer (2D)",
	"3D Platformer": "Platformer (3D)",
	"First Person Shooter": "Shooter (First Person)",
	"Third Person Shooter": "Shooter (Third Person)",
	"Top Down Shooter": "Shooter (Top Down)",
};

async function createGameGenres(transactionClient: Prisma.TransactionClient, playniteGame: PlayniteThirdPartyLib.PlayniteGame, game: Prisma.GameGetPayload<null>)
{
	for (const playniteGenre of playniteGame.Genres)
	{
		const genreName = genreNameMap[playniteGenre.Name] ?? playniteGenre.Name;

		const genre = await GenreModelLib.findOrCreateByName(transactionClient, genreName);

		await transactionClient.gameGenre.create(
			{
				data:
				{
					genre_id: genre.id,
					game_id: game.id,
				},
			});
	}
}

async function createGameModes(transactionClient: Prisma.TransactionClient, playniteGame: PlayniteThirdPartyLib.PlayniteGame, game: Prisma.GameGetPayload<null>)
{
	for (const playniteFeature of playniteGame.Features)
	{
		let mode: Prisma.ModeGetPayload<null>;

		switch (playniteFeature.Name)
		{
			case "Multiplayer > Co-op > Local":
				mode = await transactionClient.mode.findFirstOrThrow(
					{
						where:
						{
							name: "Co-op",
							isMultiplayer: true,
							isOnline: false,
						},
					});

				break;

			case "Multiplayer > Co-op > Online":
				mode = await transactionClient.mode.findFirstOrThrow(
					{
						where:
						{
							name: "Co-op",
							isMultiplayer: true,
							isOnline: true,
						},
					});

				break;

			case "Multiplayer > PvP > Local":
				mode = await transactionClient.mode.findFirstOrThrow(
					{
						where:
						{
							name: "PvP",
							isMultiplayer: true,
							isOnline: false,
						},
					});

				break;

			case "Multiplayer > PvP > Online":
				mode = await transactionClient.mode.findFirstOrThrow(
					{
						where:
						{
							name: "PvP",
							isMultiplayer: true,
							isOnline: true,
						},
					});

				break;

			case "Multiplayer > Social > Local":
				mode = await transactionClient.mode.findFirstOrThrow(
					{
						where:
						{
							name: "Social",
							isMultiplayer: true,
							isOnline: false,
						},
					});

				break;
			
			case "Multiplayer > Social > Online":
				mode = await transactionClient.mode.findFirstOrThrow(
					{
						where:
						{
							name: "Social",
							isMultiplayer: true,
							isOnline: true,
						},
					});

				break;

			case "Singleplayer":
				mode = await transactionClient.mode.findFirstOrThrow(
					{
						where:
						{
							name: "Singleplayer",
							isMultiplayer: false,
							isOnline: false,
						},
					});

				break;

			default:
				continue;
		}

		await transactionClient.gameMode.create(
			{
				data:
				{
					mode_id: mode.id,
					game_id: game.id,
				},
			});
	}
}

async function createGamePlatforms(transactionClient: Prisma.TransactionClient, playniteGame: PlayniteThirdPartyLib.PlayniteGame, game: Prisma.GameGetPayload<null>)
{
	for (const playnitePlatform of playniteGame.Platforms)
	{
		const platform = await PlatformModelLib.findOrCreateByName(transactionClient, playnitePlatform.Name);

		await transactionClient.gamePlatform.create(
			{
				data:
				{
					platform_id: platform.id,
					game_id: game.id,
				},
			});
	}
}

async function createGamePublishers(transactionClient: Prisma.TransactionClient, playniteGame: PlayniteThirdPartyLib.PlayniteGame, game: Prisma.GameGetPayload<null>)
{
	for (const publisher of playniteGame.Publishers)
	{
		const company = await CompanyModelLib.findOrCreateByName(transactionClient, publisher.Name);

		await transactionClient.gamePublisher.create(
			{
				data:
				{
					company_id: company.id,
					game_id: game.id,
				},
			});
	}
}

async function createGameSource(transactionClient: Prisma.TransactionClient, playniteGame: PlayniteThirdPartyLib.PlayniteGame, game: Prisma.GameGetPayload<null>)
{
	const source = await SourceModelLib.findOrCreateByName(transactionClient, playniteGame.Source.Name);

	await transactionClient.gameSource.create(
		{
			data:
			{
				source_id: source.id,
				game_id: game.id,
			},
		});
}

async function createGameInstallation(transactionClient: Prisma.TransactionClient, playniteGame: PlayniteThirdPartyLib.PlayniteGame, game: Prisma.GameGetPayload<null>)
{
	if (playniteGame.GameActions.length > 1)
	{
		throw new Error("Game has multiple GameActions: " + playniteGame.Name);
	}

	if (playniteGame.InstallDirectory == null)
	{
		return;
	}

	if (playniteGame.InstallSize == null)
	{
		return;
	}

	const [ fileSizeGibiBytes, fileSizeBytes ] = FileSizeLib.toGibiBytesAndBytes(playniteGame.InstallSize);

	await transactionClient.gameInstallation.create(
		{
			data:
			{
				path: playniteGame.InstallDirectory,
				fileSizeBytes,
				fileSizeGibiBytes,

				game_id: game.id,
			},
		});
}

const seriesNameMap: Record<string, string> =
{
	"-": "Unknown",
};

async function createSeriesGames(transactionClient: Prisma.TransactionClient, playniteGame: PlayniteThirdPartyLib.PlayniteGame, game: Prisma.GameGetPayload<null>)
{
	for (const playniteSeries of playniteGame.Series)
	{	
		const seriesName = seriesNameMap[playniteSeries.Name] ?? playniteSeries.Name;
	
		const series = await SeriesModelLib.findOrCreateByName(transactionClient, seriesName);

		await transactionClient.seriesGame.create(
			{
				data:
				{
					series_id: series.id,
					game_id: game.id,
				},
			});
	}
}

async function createGame(transactionClient: Prisma.TransactionClient, playniteGame: PlayniteThirdPartyLib.PlayniteGame)
{
	const [ firstPlayedDate, firstPlayedDateApproximated ] = determineFirstPlayedDate(playniteGame);

	const game = await transactionClient.game.create(
		{
			data:
			{
				createdDate: playniteGame.Added.toJSDate(),
				lastUpdatedDate: playniteGame.Modified.toJSDate(),

				name: playniteGame.Name,
				sortName: playniteGame.SortingName,
				releaseDate: playniteGame.ReleaseDate?.ReleaseDate.toJSDate() ?? null,
				description: playniteGame.Description,
				notes: playniteGame.Notes,

				isEarlyAccess: determineIsEarlyAccess(playniteGame),
				isFavorite: playniteGame.Favorite,
				isHidden: false,
				isNsfw: playniteGame.Hidden, // Note: I only currently hide NSFW games atm but I'm adding a dedicated field for this, so just setting it *that* value
				isShelved: determineIsShelved(playniteGame),

				progressionType: determineProgressionType(playniteGame),
				completionStatus: determineCompletionStatus(playniteGame),
				firstPlayedDate,
				firstPlayedDateApproximated,
				firstCompletedDate: determineFirstCompletedDate(playniteGame),
				firstCompletedDateApproximated: true,
				lastPlayedDate: playniteGame.LastActivity?.toJSDate() ?? null,
				playCount: playniteGame.PlayCount,
				playTimeTotalSeconds: playniteGame.Playtime,

				achievementSupport: determineAchievementSupport(playniteGame),
				controllerSupport: determineControllerSupport(playniteGame),
				modSupport: null,
				virtualRealitySupport: determineVirtualRealitySupport(playniteGame),

				playniteGameId: playniteGame.Id,
				steamAppId: determineSteamAppId(playniteGame),
			},
		});

	await createGamePlayAction(transactionClient, playniteGame, game);

	await createGameAntiCheats(transactionClient, playniteGame, game);

	await createGameDevelopers(transactionClient, playniteGame, game);

	await createGameDrms(transactionClient, playniteGame, game);

	await createGameEngines(transactionClient, playniteGame, game);

	await createGameGenres(transactionClient, playniteGame, game);

	await createGameInstallation(transactionClient, playniteGame, game);

	await createGameModes(transactionClient, playniteGame, game);
	
	await createGamePlatforms(transactionClient, playniteGame, game);

	await createGamePublishers(transactionClient, playniteGame, game);

	await createGameSource(transactionClient, playniteGame, game);

	await createSeriesGames(transactionClient, playniteGame, game);
}

async function main()
{	
	//
	// Load Playnite Games
	//

	const rawPlayniteGamesText = await fs.promises.readFile("./playnite-games.json", "utf-8");

	const rawPlayniteGames = JSON.parse(rawPlayniteGamesText) as unknown[];

	//
	// Process Playnite Games
	//

	for (const rawPlayniteGame of rawPlayniteGames)
	{
		const playniteGameParseResult = PlayniteThirdPartyLib.PlayniteGameSchema.safeParse(rawPlayniteGame);

		if (!playniteGameParseResult.success)
		{
			console.log(JSON.stringify(playniteGameParseResult));

			process.exit();
		}

		const playniteGame = playniteGameParseResult.data;

		if (playniteGame.Source.Name != "Steam")
		{
			continue;
		}

		const existingGame = await prismaClient.game.findFirst(
			{
				where:
				{
					playniteGameId: playniteGame.Id,
				},
			});
	
		if (existingGame != null)
		{
			continue;
		}

		try
		{
			console.log("Importing Playnite Game: " + playniteGame.Name);
		
			await prismaClient.$transaction(
				async (transactionClient) =>
				{
					await createGame(transactionClient, playniteGame);
				});
		}
		catch (error)
		{
			console.error("Failed to import Playnite Game:", playniteGame.Name, error);
		}
	}
}

//
// Scripts
//

await main();