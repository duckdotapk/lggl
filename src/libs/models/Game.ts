//
// Imports
//

import path from "node:path";

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { GroupManager } from "../../classes/GroupManager.js";

import { HumanDateTime } from "../../components/basic/HumanDateTime.js";

import { LGGL_DATA_DIRECTORY } from "../../env/LGGL_DATA_DIRECTORY.js";

import { staticMiddleware } from "../../instances/server.js";

import * as GamePlaySessionModelLib from "./GamePlaySession.js";
import * as SettingModelLib from "./Setting.js";

import * as GameSchemaLib from "../schemas/Game.js";

//
// Constants
//

const progressionTypeNames: Record<GameSchemaLib.ProgressionType, string> =
{
	"NONE": "None",
	"NON_CAMPAIGN": "Non-Campaign",
	"CAMPAIGN": "Campaign",
};

const completionStatusIconNames: Record<GameSchemaLib.CompletionStatus, string> =
{
	"TODO": "fa-solid fa-circle-dashed",
	"IN_PROGRESS": "fa-solid fa-circle-half",
	"COMPLETE": "fa-solid fa-circle",
	"ONE_HUNDRED_PERCENT": "fa-solid fa-check-circle",
};

const completionStatusNames: Record<GameSchemaLib.CompletionStatus, string> =
{
	"TODO": "To Do",
	"IN_PROGRESS": "In Progress",
	"COMPLETE": "Complete",
	"ONE_HUNDRED_PERCENT": "100%",
};

const achievementSupportNames: Record<GameSchemaLib.AchievementSupport, string> =
{
	"NONE": "None",
	"INGAME": "In-Game",
	"LAUNCHER": "Launcher",
};

const controllerSupportNames: Record<GameSchemaLib.ControllerSupport, string> =
{
	"NONE": "None",
	"SUPPORTED": "Supported",
	"REQUIRED": "Required",
};

const modSupportNames: Record<GameSchemaLib.ModSupport, string> =
{
	"NONE": "None",
	"UNOFFICIAL": "Unofficial",
	"OFFICIAL": "Official",
};

const virtualRealitySupportNames: Record<GameSchemaLib.VirtualRealitySupport, string> =
{
	"NONE": "None",
	"SUPPORTED": "Supported",
	"REQUIRED": "Required",
};

//
// Create/Find/Update/Delete Functions
//

export type FindGroupsOptions =
{
	settings: SettingModelLib.Settings;
	selectedGame: Prisma.GameGetPayload<null> | null;
};

export async function findGroups(transactionClient: Prisma.TransactionClient, options: FindGroupsOptions)
{
	let games = await transactionClient.game.findMany(
		{
			include:
			{
				seriesGames:
				{
					include:
					{
						series: true,
					},
				},
			},
		});

	if (!options.settings.showVisibleGames)
	{
		games = games.filter((game) => game.isHidden || game.isNsfw);
	}

	if (!options.settings.showHiddenGames)
	{
		games = games.filter((game) => !game.isHidden);
	}

	if (!options.settings.showNsfwGames)
	{
		games = games.filter((game) => !game.isNsfw);
	}

	const groupManager = new GroupManager<typeof games[0]>(
		(game) =>
		{
			return {
				selected: game.id == options.selectedGame?.id,
				href: "/games/view/" + game.id,
				iconName: game.hasIconImage
					? staticMiddleware.getCacheBustedPath("/data/images/games/" + game.id + "/icon.jpg")
					: "fa-solid fa-gamepad-modern",
				name: game.name,
				info: game.lastPlayedDate != null
					? ([ "Last played ", HumanDateTime(DateTime.fromJSDate(game.lastPlayedDate), DateTime.DATE_MED) ])
					: [],
			};
		});

	switch (options.settings.gameGroupMode)
	{
		case "lastPlayed":
		{
			const sortedGames = games.toSorted((a, b) => (b.lastPlayedDate ?? new Date(0)).getTime() - (a.lastPlayedDate ?? new Date(0)).getTime());

			if (options.settings.showFavoritesGroup)
			{
				groupManager.addItemsToGroup("Favorites", sortedGames.filter((game) => game.isFavorite));
			}

			const playedSortedGames = sortedGames.filter((game) => game.lastPlayedDate != null);

			for (const game of playedSortedGames)
			{
				groupManager.addItemToGroup(DateTime.fromJSDate(game.lastPlayedDate!).year.toString(), game);
			}

			const unplayedSortedGames = sortedGames
				.filter((game) => game.lastPlayedDate == null)
				.toSorted((a, b) => a.sortName.localeCompare(b.sortName));

			groupManager.addItemsToGroup("Unplayed", unplayedSortedGames);

			break;
		}

		case "name":
		{
			const sortedGames = games.toSorted((a, b) => a.sortName.localeCompare(b.sortName));

			if (options.settings.showFavoritesGroup)
			{
				groupManager.addItemsToGroup("Favorites", sortedGames.filter((game) => game.isFavorite));
			}

			for (const game of sortedGames)
			{
				const groupName = GroupManager.getNameGroupName(game.sortName);

				groupManager.addItemToGroup(groupName, game);
			}

			break;
		}

		case "playTime":
		{
			const sortedGames = games.toSorted((a, b) => b.playTimeTotalSeconds - a.playTimeTotalSeconds);

			if (options.settings.showFavoritesGroup)
			{
				groupManager.addItemsToGroup("Favorites", sortedGames.filter((game) => game.isFavorite));
			}

			const playedSortedGames = sortedGames.filter((game) => game.playTimeTotalSeconds > 0);

			for (const playedGame of playedSortedGames)
			{
				const playTimeTotalHours = Math.floor(playedGame.playTimeTotalSeconds / 3600);

				if (playTimeTotalHours >= 1000)
				{
					groupManager.addItemToGroup("Over 1000 hours", playedGame);
				}
				else if (playTimeTotalHours >= 750)
				{
					groupManager.addItemToGroup("Over 750 hours", playedGame);
				}
				else if (playTimeTotalHours >= 500)
				{
					groupManager.addItemToGroup("Over 500 hours", playedGame);
				}
				else if (playTimeTotalHours >= 250)
				{
					groupManager.addItemToGroup("Over 250 hours", playedGame);
				}
				else if (playTimeTotalHours >= 100)
				{
					groupManager.addItemToGroup("Over 100 hours", playedGame);
				}
				else if (playTimeTotalHours >= 50)
				{
					groupManager.addItemToGroup("Over 50 hours", playedGame);
				}
				else if (playTimeTotalHours >= 10)
				{
					groupManager.addItemToGroup("Over 10 hours", playedGame);
				}
				else if (playTimeTotalHours >= 5)
				{
					groupManager.addItemToGroup("Over 5 hours", playedGame);
				}
				else if (playTimeTotalHours >= 4)
				{
					groupManager.addItemToGroup("Over 4 hours", playedGame);
				}
				else if (playTimeTotalHours >= 3)
				{
					groupManager.addItemToGroup("Over 3 hours", playedGame);
				}
				else if (playTimeTotalHours >= 2)
				{
					groupManager.addItemToGroup("Over 2 hours", playedGame);
				}
				else if (playTimeTotalHours >= 1)
				{
					groupManager.addItemToGroup("Over 1 hour", playedGame);
				}
				else
				{
					groupManager.addItemToGroup("Under 1 hour", playedGame);
				}
			}

			const unplayedSortedGames = sortedGames
				.filter((game) => game.playTimeTotalSeconds == 0)
				.sort((a, b) => a.sortName.localeCompare(b.sortName));
	
			groupManager.addItemsToGroup("No play time", unplayedSortedGames);

			break;
		}

		case "series":
		{
			const seriesWithGamesBySeriesName: Map<string, 
				{ 
					series: Prisma.SeriesGetPayload<null>, 
					games: typeof games,
				}> = new Map();
	
			for (const game of games)
			{
				if (game.seriesGames.length === 0)
				{
					continue;
				}
	
				for (const seriesGame of game.seriesGames)
				{
					const seriesWithGames = seriesWithGamesBySeriesName.get(seriesGame.series.name) ??
					{
						series: seriesGame.series,
						games: [],
					};
	
					seriesWithGames.games.push(game);
	
					seriesWithGamesBySeriesName.set(seriesGame.series.name, seriesWithGames);
				}
			}
	
			for (const [ seriesName, seriesWithGames ] of seriesWithGamesBySeriesName.entries())
			{
				seriesWithGamesBySeriesName.set(seriesName,
					{
						series: seriesWithGames.series,
						games: seriesWithGames.games.sort(
							(a, b) =>
							{
								const seriesGameA = a.seriesGames.find((seriesGame) => seriesGame.series_id = seriesWithGames.series.id)!;
	
								const seriesGameB = b.seriesGames.find((seriesGame) => seriesGame.series_id = seriesWithGames.series.id)!;
	
								if (seriesGameA.number < seriesGameB.number)
								{
									return -1;
								}
	
								if (seriesGameA.number > seriesGameB.number)
								{
									return 1;
								}
	
								// TODO: sort games by release date after number!
	
								return a.sortName.localeCompare(b.sortName);
							}),
					});
			}
	
			const gamesWithoutSeries = games
				.filter((game) => game.seriesGames.length == 0)
				.sort((a, b) => a.sortName.localeCompare(b.sortName));

			const sortedSeriesWithGames = Array.from(seriesWithGamesBySeriesName.values()).sort((a, b) => a.series.name.localeCompare(b.series.name));
	
			if (options.settings.showFavoritesGroup)
			{
				for (const seriesWithGames of sortedSeriesWithGames)
				{
					const favoriteGames = seriesWithGames.games.filter((game) => game.isFavorite);
	
					groupManager.addItemsToGroup("Favorites: " + seriesWithGames.series.name, favoriteGames);
				}
	
				const favoriteGamesWithoutSeries = gamesWithoutSeries.filter((game) => game.isFavorite);
	
				groupManager.addItemsToGroup("Favorites: -", favoriteGamesWithoutSeries);
			}
	
			for (const seriesWithGames of sortedSeriesWithGames)
			{
				groupManager.addItemsToGroup(seriesWithGames.series.name, seriesWithGames.games);
			}
	
			if (gamesWithoutSeries.length > 0)
			{
				groupManager.addItemsToGroup("-", gamesWithoutSeries);
			}

			break;
		}
	}

	return groupManager;
}

//
// Utility Functions
//

export function getImageUrls(game: Prisma.GameGetPayload<null>)
{
	return {
		banner: "/data/images/games/" + game.id + "/banner.jpg",
		cover: "/data/images/games/" + game.id + "/cover.jpg",
		icon: "/data/images/games/" + game.id + "/icon.jpg",
		logo: "/data/images/games/" + game.id + "/logo.png",
	};
}

export function getImagePaths(game: Prisma.GameGetPayload<null>)
{
	return {
		banner: path.join(LGGL_DATA_DIRECTORY, "images", "games", game.id.toString(), "banner.jpg"),
		cover: path.join(LGGL_DATA_DIRECTORY, "images", "games", game.id.toString(), "cover.jpg"),
		icon: path.join(LGGL_DATA_DIRECTORY, "images", "games", game.id.toString(), "icon.jpg"),
		logo: path.join(LGGL_DATA_DIRECTORY, "images", "games", game.id.toString(), "logo.png"),
	}
}

export function getCompletionStatusIconName(gameOrCompletionStatus: Prisma.GameGetPayload<null> | GameSchemaLib.CompletionStatus)
{
	if (typeof gameOrCompletionStatus == "string")
	{
		return completionStatusIconNames[gameOrCompletionStatus];
	}

	if (gameOrCompletionStatus.completionStatus == null)
	{
		return "fa-solid fa-circle";
	}

	const completionStatusParseResult = GameSchemaLib.CompletionStatusSchema.safeParse(gameOrCompletionStatus.completionStatus);

	return completionStatusParseResult.success
		? completionStatusIconNames[completionStatusParseResult.data]
		: "fa-solid fa-question";
}

export function getCompletionStatusName(gameOrCompletionStatus: Prisma.GameGetPayload<null> | GameSchemaLib.CompletionStatus)
{
	if (typeof gameOrCompletionStatus == "string")
	{
		return completionStatusNames[gameOrCompletionStatus];
	}

	if (gameOrCompletionStatus.completionStatus == null)
	{
		return "-";
	}

	const completionStatusParseResult = GameSchemaLib.CompletionStatusSchema.safeParse(gameOrCompletionStatus.completionStatus);

	return completionStatusParseResult.success
		? completionStatusNames[completionStatusParseResult.data]
		: "Invalid: " + gameOrCompletionStatus.completionStatus;
}

export function getProgressionTypeName(gameOrProgressionType: Prisma.GameGetPayload<null> | GameSchemaLib.ProgressionType)
{
	if (typeof gameOrProgressionType == "string")
	{
		return progressionTypeNames[gameOrProgressionType];
	}

	if (gameOrProgressionType.progressionType == null)
	{
		return "-";
	}

	const progressionTypeParseResult = GameSchemaLib.ProgressionTypeSchema.safeParse(gameOrProgressionType.progressionType);

	return progressionTypeParseResult.success
		? progressionTypeNames[progressionTypeParseResult.data]
		: "Invalid: " + gameOrProgressionType.progressionType;
}

export function getAchievementSupportName(gameOrAchievementSupport: Prisma.GameGetPayload<null> | GameSchemaLib.AchievementSupport)
{
	if (typeof gameOrAchievementSupport == "string")
	{
		return achievementSupportNames[gameOrAchievementSupport];
	}

	if (gameOrAchievementSupport.achievementSupport == null)
	{
		return "-";
	}

	const achievementSupportParseResult = GameSchemaLib.AchievementSupportSchema.safeParse(gameOrAchievementSupport.achievementSupport);

	return achievementSupportParseResult.success
		? achievementSupportNames[achievementSupportParseResult.data]
		: "Invalid: " + gameOrAchievementSupport.achievementSupport;
}

export function getControllerSupportName(gameOrControllerSupport: Prisma.GameGetPayload<null> | GameSchemaLib.ControllerSupport)
{
	if (typeof gameOrControllerSupport == "string")
	{
		return controllerSupportNames[gameOrControllerSupport];
	}

	if (gameOrControllerSupport.controllerSupport == null)
	{
		return "-";
	}

	const controllerSupportParseResult = GameSchemaLib.ControllerSupportSchema.safeParse(gameOrControllerSupport.controllerSupport);

	return controllerSupportParseResult.success
		? controllerSupportNames[controllerSupportParseResult.data]
		: "Invalid: " + gameOrControllerSupport.controllerSupport;
}

export function getModSupportName(gameOrModSupport: Prisma.GameGetPayload<null> | GameSchemaLib.ModSupport)
{
	if (typeof gameOrModSupport == "string")
	{
		return modSupportNames[gameOrModSupport];
	}

	if (gameOrModSupport.modSupport == null)
	{
		return "-";
	}

	const modSupportParseResult = GameSchemaLib.ModSupportSchema.safeParse(gameOrModSupport.modSupport);

	return modSupportParseResult.success
		? modSupportNames[modSupportParseResult.data]
		: "Invalid: " + gameOrModSupport.modSupport;
}

export function getVirtualRealitySupportName(gameOrVirtualRealitySupport: Prisma.GameGetPayload<null> | GameSchemaLib.VirtualRealitySupport)
{
	if (typeof gameOrVirtualRealitySupport == "string")
	{
		return virtualRealitySupportNames[gameOrVirtualRealitySupport];
	}

	if (gameOrVirtualRealitySupport.virtualRealitySupport == null)
	{
		return "-";
	}

	const virtualRealitySupportParseResult = GameSchemaLib.VirtualRealitySupportSchema.safeParse(gameOrVirtualRealitySupport.virtualRealitySupport);

	return virtualRealitySupportParseResult.success
		? virtualRealitySupportNames[virtualRealitySupportParseResult.data]
		: "Invalid: " + gameOrVirtualRealitySupport.virtualRealitySupport;
}

export function hasActiveSession(game: Prisma.GameGetPayload<null>)
{
	return GamePlaySessionModelLib.gamesWithActiveSessions.has(game.id);
}