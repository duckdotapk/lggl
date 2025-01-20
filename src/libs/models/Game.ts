//
// Imports
//

import fs from "node:fs";
import path from "node:path";

import { Child } from "@donutteam/document-builder";
import { GameAchievementSupport, GameCompletionStatus, GameControllerSupport, GameLogoImageAlignment, GameLogoImageJustification, GameModSupport, GameProgressionType, GameSteamDeckCompatibility, GameVirtualRealitySupport, Prisma } from "@prisma/client";
import { DateTime } from "luxon";
import { z } from "zod";

import { GroupManager } from "../../classes/GroupManager.js";

import { HumanDateTime } from "../../components/basic/HumanDateTime.js";

import { LGGL_DATA_DIRECTORY } from "../../env/LGGL_DATA_DIRECTORY.js";

import { shortEnglishHumanizer } from "../../instances/humanizer.js";
import { staticMiddleware } from "../../instances/server.js";

import * as GameModelLib from "./Game.js";
import * as GamePlaySessionModelLib from "./GamePlaySession.js";
import * as SettingModelLib from "./Setting.js";

import * as AuditLib from "../Audit.js";

//
// Constants
//

const progressionTypeNames: Record<GameProgressionType, string> =
{
	"NONE": "None",
	"NON_CAMPAIGN": "Non-Campaign",
	"CAMPAIGN": "Campaign",
};

const logoImageAlignmentNames: Record<GameLogoImageAlignment, string> =
{
	"START": "Top",
	"CENTER": "Center",
	"END": "Bottom",
};

const logoImageJustificationNames: Record<GameLogoImageJustification, string> =
{
	"START": "Left",
	"CENTER": "Center",
};

const completionStatusIconNames: Record<GameCompletionStatus, string> =
{
	"TODO": "fa-solid fa-circle-dashed",
	"IN_PROGRESS": "fa-solid fa-circle-half",
	"COMPLETE": "fa-solid fa-circle",
	"ONE_HUNDRED_PERCENT": "fa-solid fa-check-circle",
};

const completionStatusNames: Record<GameCompletionStatus, string> =
{
	"TODO": "To Do",
	"IN_PROGRESS": "In Progress",
	"COMPLETE": "Complete",
	"ONE_HUNDRED_PERCENT": "100%",
};

const achievementSupportNames: Record<GameAchievementSupport, string> =
{
	"NONE": "None",
	"INGAME": "In-Game",
	"LAUNCHER": "Launcher",
};

const controllerSupportNames: Record<GameControllerSupport, string> =
{
	"NONE": "None",
	"SUPPORTED": "Supported",
	"REQUIRED": "Required",
};

const modSupportNames: Record<GameModSupport, string> =
{
	"NONE": "None",
	"UNOFFICIAL": "Unofficial",
	"OFFICIAL": "Official",
};

const virtualRealitySupportNames: Record<GameVirtualRealitySupport, string> =
{
	"NONE": "None",
	"SUPPORTED": "Supported",
	"REQUIRED": "Required",
};

const steamDeckCompatibilityIconNames: Record<GameSteamDeckCompatibility, string> =
{
	"UNKNOWN": "fa-solid fa-question-circle",
	"UNSUPPORTED": "fa-solid fa-times-circle",
	"PLAYABLE": "fa-solid fa-circle",
	"VERIFIED": "fa-solid fa-check-circle",
};

const steamDeckCompatibilityNames: Record<GameSteamDeckCompatibility, string> =
{
	"UNKNOWN": "Unknown",
	"UNSUPPORTED": "Unsupported",
	"PLAYABLE": "Playable",
	"VERIFIED": "Verified",
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
				gameCompanies:
				{
					include:
					{
						company: true,
					},
				},
				gameEngines:
				{
					include:
					{
						engine: true,
					},
				},
				seriesGames:
				{
					include:
					{
						series: true,
					},
				},
			},
		});

	if (!options.settings.showRegularGames)
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

	switch (options.settings.gameGroupMode)
	{
		case "completionStatus":
		{
			const groupManager = new GroupManager<typeof games[0]>(
				{
					mapGroupModel: (game) =>
					{
						return {
							selected: game.id == options.selectedGame?.id,
							href: "/games/view/" + game.id,
							extraAtrributes:
							{
								"data-is-installed": game.isInstalled,
							},
							iconName: game.hasIconImage
								? staticMiddleware.getCacheBustedPath("/data/images/games/" + game.id + "/icon.jpg")
								: "fa-solid fa-gamepad-modern",
							name: game.name,
							info: game.lastPlayedDate != null
								? ([ "Last played ", HumanDateTime(DateTime.fromJSDate(game.lastPlayedDate), DateTime.DATE_MED) ])
								: null,
						};
					},
				});

			if (options.settings.showFavoritesGroup)
			{
				groupManager.addGroup("Favorites");
			}

			groupManager.addGroup("100%");

			groupManager.addGroup("Complete");

			groupManager.addGroup("In Progress");

			groupManager.addGroup("To Do");

			groupManager.addGroup("Shelved");

			groupManager.addGroup("-");
			
			const sortedGames = games.toSorted((a, b) => a.sortName.localeCompare(b.sortName));

			for (const game of sortedGames)
			{
				if (game.isShelved)
				{
					groupManager.addItemToGroup("Shelved", game);

					continue;
				}

				switch (game.completionStatus)
				{
					case "ONE_HUNDRED_PERCENT":
					{
						groupManager.addItemToGroup("100%", game);

						break;
					}

					case "COMPLETE":
					{
						groupManager.addItemToGroup("Complete", game);

						break;
					}

					case "IN_PROGRESS":
					{
						groupManager.addItemToGroup("In Progress", game);

						break;
					}

					case "TODO":
					{
						groupManager.addItemToGroup("To Do", game);

						break;
					}
					
					case null:
					{
						groupManager.addItemToGroup("-", game);

						break;
					}
				}
			}

			return groupManager;
		}

		case "createdDate":
		{
			const groupManager = new GroupManager<typeof games[0]>(
				{
					mapGroupModel: (game) =>
					{
						return {
							selected: game.id == options.selectedGame?.id,
							href: "/games/view/" + game.id,
							extraAtrributes:
							{
								"data-is-installed": game.isInstalled,
							},
							iconName: game.hasIconImage
								? staticMiddleware.getCacheBustedPath("/data/images/games/" + game.id + "/icon.jpg")
								: "fa-solid fa-gamepad-modern",
							name: game.name,
							info:
							[ 
								"Created ", 
								HumanDateTime(DateTime.fromJSDate(game.createdDate), DateTime.DATE_MED),
							],
						};
					},
				});

			if (options.settings.showFavoritesGroup)
			{
				groupManager.addGroup("Favorites");
			}

			const sortedGames = games.toSorted((a, b) => b.createdDate.getTime() - a.createdDate.getTime());

			for (const game of sortedGames)
			{
				if (options.settings.showFavoritesGroup && game.isFavorite)
				{
					groupManager.addItemToGroup("Favorites", game);
				}

				const createdDateTime = DateTime.fromJSDate(game.createdDate);

				if (createdDateTime.hasSame(DateTime.local(), "day"))
				{
					groupManager.addItemToGroup("Today", game);
				}
				else if (createdDateTime.hasSame(DateTime.local().minus({ days: 1 }), "day"))
				{
					groupManager.addItemToGroup("Yesterday", game);
				}
				else if (createdDateTime.hasSame(DateTime.local(), "week"))
				{
					groupManager.addItemToGroup("This Week", game);
				}
				else if (createdDateTime.hasSame(DateTime.local().minus({ weeks: 1 }), "week"))
				{
					groupManager.addItemToGroup("Last Week", game);
				}
				else if (createdDateTime.hasSame(DateTime.local(), "year"))
				{
					const groupName = createdDateTime.monthLong + " " + createdDateTime.year.toString();

					groupManager.addItemToGroup(groupName, game);
				}
				else
				{
					const groupName = createdDateTime.year.toString();

					groupManager.addItemToGroup(groupName, game);
				}
			}

			return groupManager;
		}

		case "developer":
		{
			const groupManager = new GroupManager<typeof games[0]>(
				{
					sortGroups: (a, b) =>
					{
						if (b.sortOrder != a.sortOrder)
						{
							return b.sortOrder - a.sortOrder;
						}

						return a.name.localeCompare(b.name);
					},
					mapGroupModel: (game) =>
					{
						return {
							selected: game.id == options.selectedGame?.id,
							href: "/games/view/" + game.id,
							extraAtrributes:
							{
								"data-is-installed": game.isInstalled,
							},
							iconName: game.hasIconImage
								? staticMiddleware.getCacheBustedPath("/data/images/games/" + game.id + "/icon.jpg")
								: "fa-solid fa-gamepad-modern",
							name: game.name,
							info: game.lastPlayedDate != null
								? ([ "Last played ", HumanDateTime(DateTime.fromJSDate(game.lastPlayedDate), DateTime.DATE_MED) ])
								: null,
						};
					},
				});

			if (options.settings.showFavoritesGroup)
			{
				groupManager.addGroup("Favorites", 1);
			}

			groupManager.addGroup("-", -1);

			const sortedGames = games.toSorted((a, b) => a.sortName.localeCompare(b.sortName));

			for (const game of sortedGames)
			{
				if (options.settings.showFavoritesGroup && game.isFavorite)
				{
					groupManager.addItemToGroup("Favorites", game);
				}

				const gameDevelopers = game.gameCompanies.filter((gameCompany) => gameCompany.type == "DEVELOPER");				

				if (gameDevelopers.length > 0)
				{
					for (const gameDeveloper of gameDevelopers)
					{
						groupManager.addItemToGroup(gameDeveloper.company.name, game);
					}
				}
				else
				{
					groupManager.addItemToGroup("-", game);
				}
			}

			return groupManager;
		}

		case "engine":
		{
			const groupManager = new GroupManager<typeof games[0]>(
				{
					sortGroups: (a, b) =>
					{
						if (b.sortOrder != a.sortOrder)
						{
							return b.sortOrder - a.sortOrder;
						}

						return a.name.localeCompare(b.name);
					},
					mapGroupModel: (game) =>
					{
						return {
							selected: game.id == options.selectedGame?.id,
							href: "/games/view/" + game.id,
							extraAtrributes:
							{
								"data-is-installed": game.isInstalled,
							},
							iconName: game.hasIconImage
								? staticMiddleware.getCacheBustedPath("/data/images/games/" + game.id + "/icon.jpg")
								: "fa-solid fa-gamepad-modern",
							name: game.name,
							info: game.lastPlayedDate != null
								? ([ "Last played ", HumanDateTime(DateTime.fromJSDate(game.lastPlayedDate), DateTime.DATE_MED) ])
								: null,
						};
					},
				});

			if (options.settings.showFavoritesGroup)
			{
				groupManager.addGroup("Favorites", 1);
			}

			groupManager.addGroup("-", -1);

			const sortedGames = games.toSorted((a, b) => a.sortName.localeCompare(b.sortName));

			for (const game of sortedGames)
			{
				if (options.settings.showFavoritesGroup && game.isFavorite)
				{
					groupManager.addItemToGroup("Favorites", game);
				}

				if (game.gameEngines.length > 0)
				{
					for (const gameEngine of game.gameEngines)
					{
						groupManager.addItemToGroup(gameEngine.engine.name, game);
					}
				}
				else
				{
					groupManager.addItemToGroup("-", game);
				}
			}

			return groupManager;
		}

		case "firstCompletedDate":
		{
			const groupManager = new GroupManager<typeof games[0]>(
				{
					mapGroupModel: (game) =>
					{
						let info: Child;

						if (game.firstCompletedDate != null && !game.firstCompletedDateApproximated)
						{
							info =
							[
								"First completed on ",
								HumanDateTime(DateTime.fromJSDate(game.firstCompletedDate), DateTime.DATE_MED),
							];
						}
						else
						{
							info = null;
						}

						return {
							selected: game.id == options.selectedGame?.id,
							href: "/games/view/" + game.id,
							extraAtrributes:
							{
								"data-is-installed": game.isInstalled,
							},
							iconName: game.hasIconImage
								? staticMiddleware.getCacheBustedPath("/data/images/games/" + game.id + "/icon.jpg")
								: "fa-solid fa-gamepad-modern",
							name: game.name,
							info,
						};
					},
				});

			if (options.settings.showFavoritesGroup)
			{
				groupManager.addGroup("Favorites");
			}

			groupManager.addGroup("Unknown", -1);

			groupManager.addGroup("Not completed", -2);

			const firstCompletedOnKnownDateGames = games
				.filter((game) => game.firstCompletedDate != null && game.firstCompletedDate.getTime() != 0)
				.toSorted((a, b) => b.firstCompletedDate!.getTime() - a.firstCompletedDate!.getTime());

			for (const game of firstCompletedOnKnownDateGames)
			{
				if (options.settings.showFavoritesGroup && game.isFavorite)
				{
					groupManager.addItemToGroup("Favorites", game);
				}

				groupManager.addItemToGroup(game.firstCompletedDate!.getFullYear().toString(), game);
			}

			const firstCompletedOnUnknownDateGames = games
				.filter((game) => game.firstCompletedDate != null && game.firstCompletedDate.getTime() == 0)
				.toSorted((a, b) => a.sortName.localeCompare(b.sortName));

			for (const game of firstCompletedOnUnknownDateGames)
			{
				if (options.settings.showFavoritesGroup && game.isFavorite)
				{
					groupManager.addItemToGroup("Favorites", game);
				}

				groupManager.addItemToGroup("Unknown", game);
			}

			const notCompletedGames = games
				.filter((game) => game.firstCompletedDate == null)
				.toSorted((a, b) => a.sortName.localeCompare(b.sortName));

			for (const game of notCompletedGames)
			{
				if (options.settings.showFavoritesGroup && game.isFavorite)
				{
					groupManager.addItemToGroup("Favorites", game);
				}

				groupManager.addItemToGroup("Not completed", game);
			}

			return groupManager;
		}

		case "firstPlayedDate":
		{
			const groupManager = new GroupManager<typeof games[0]>(
				{
					mapGroupModel: (game) =>
					{
						let info: Child;

						if (game.firstPlayedDate != null && !game.firstPlayedDateApproximated)
						{
							info =
							[
								"First played on ",
								HumanDateTime(DateTime.fromJSDate(game.firstPlayedDate), DateTime.DATE_MED),
							];
						}
						else
						{
							info = null;
						}

						return {
							selected: game.id == options.selectedGame?.id,
							href: "/games/view/" + game.id,
							extraAtrributes:
							{
								"data-is-installed": game.isInstalled,
							},
							iconName: game.hasIconImage
								? staticMiddleware.getCacheBustedPath("/data/images/games/" + game.id + "/icon.jpg")
								: "fa-solid fa-gamepad-modern",
							name: game.name,
							info,
						};
					},
				});

			if (options.settings.showFavoritesGroup)
			{
				groupManager.addGroup("Favorites");
			}

			groupManager.addGroup("Unknown", -1);

			groupManager.addGroup("Not played", -2);

			const firstPlayedOnKnownDateGames = games
				.filter((game) => game.firstPlayedDate != null && game.firstPlayedDate.getTime() != 0)
				.toSorted((a, b) => b.firstPlayedDate!.getTime() - a.firstPlayedDate!.getTime());

			for (const game of firstPlayedOnKnownDateGames)
			{
				if (options.settings.showFavoritesGroup && game.isFavorite)
				{
					groupManager.addItemToGroup("Favorites", game);
				}

				groupManager.addItemToGroup(game.firstPlayedDate!.getFullYear().toString(), game);
			}

			const firstPlayedOnUnknownDateGames = games
				.filter((game) => game.firstPlayedDate != null && game.firstPlayedDate.getTime() == 0)
				.toSorted((a, b) => a.sortName.localeCompare(b.sortName));

			for (const game of firstPlayedOnUnknownDateGames)
			{
				if (options.settings.showFavoritesGroup && game.isFavorite)
				{
					groupManager.addItemToGroup("Favorites", game);
				}

				groupManager.addItemToGroup("Unknown", game);
			}

			const notPlayedGames = games
				.filter((game) => game.firstPlayedDate == null)
				.toSorted((a, b) => a.sortName.localeCompare(b.sortName));

			for (const game of notPlayedGames)
			{
				if (options.settings.showFavoritesGroup && game.isFavorite)
				{
					groupManager.addItemToGroup("Favorites", game);
				}

				groupManager.addItemToGroup("Not played", game);
			}

			return groupManager;
		}

		case "lastPlayedDate":
		{
			const groupManager = new GroupManager<typeof games[0]>(
				{
					mapGroupModel: (game) =>
					{
						return {
							selected: game.id == options.selectedGame?.id,
							href: "/games/view/" + game.id,
							extraAtrributes:
							{
								"data-is-installed": game.isInstalled,
							},
							iconName: game.hasIconImage
								? staticMiddleware.getCacheBustedPath("/data/images/games/" + game.id + "/icon.jpg")
								: "fa-solid fa-gamepad-modern",
							name: game.name,
							info: game.lastPlayedDate != null
								? ([ "Last played ", HumanDateTime(DateTime.fromJSDate(game.lastPlayedDate), DateTime.DATE_MED) ])
								: null,
						};
					},
				});

			if (options.settings.showFavoritesGroup)
			{
				groupManager.addGroup("Favorites");
			}

			const playedGames = games
				.filter((game) => game.lastPlayedDate != null)
				.toSorted((a, b) => b.lastPlayedDate!.getTime() - a.lastPlayedDate!.getTime());

			for (const game of playedGames)
			{
				if (options.settings.showFavoritesGroup && game.isFavorite)
				{
					groupManager.addItemToGroup("Favorites", game);
				}

				const lastPlayedDateTime = DateTime.fromJSDate(game.lastPlayedDate!);

				if (lastPlayedDateTime.hasSame(DateTime.local(), "day"))
				{
					groupManager.addItemToGroup("Today", game);
				}
				else if (lastPlayedDateTime.hasSame(DateTime.local().minus({ days: 1 }), "day"))
				{
					groupManager.addItemToGroup("Yesterday", game);
				}
				else if (lastPlayedDateTime.hasSame(DateTime.local(), "week"))
				{
					groupManager.addItemToGroup("This Week", game);
				}
				else if (lastPlayedDateTime.hasSame(DateTime.local().minus({ weeks: 1 }), "week"))
				{
					groupManager.addItemToGroup("Last Week", game);
				}
				else if (lastPlayedDateTime.hasSame(DateTime.local(), "year"))
				{
					const groupName = lastPlayedDateTime.monthLong + " " + lastPlayedDateTime.year.toString();

					groupManager.addItemToGroup(groupName, game);
				}
				else
				{
					const groupName = lastPlayedDateTime.year.toString();

					groupManager.addItemToGroup(groupName, game);
				}
			}

			const unplayedGames = games
				.filter((game) => game.lastPlayedDate == null)
				.toSorted((a, b) => a.sortName.localeCompare(b.sortName));

			for (const game of unplayedGames)
			{
				if (options.settings.showFavoritesGroup && game.isFavorite)
				{
					groupManager.addItemToGroup("Favorites", game);
				}

				groupManager.addItemToGroup("Unplayed", game);
			}

			return groupManager;
		}

		case "name":
		{
			const groupManager = new GroupManager<typeof games[0]>(
				{
					mapGroupModel: (game) =>
					{
						return {
							selected: game.id == options.selectedGame?.id,
							href: "/games/view/" + game.id,
							extraAtrributes:
							{
								"data-is-installed": game.isInstalled,
							},
							iconName: game.hasIconImage
								? staticMiddleware.getCacheBustedPath("/data/images/games/" + game.id + "/icon.jpg")
								: "fa-solid fa-gamepad-modern",
							name: game.name,
							info: game.lastPlayedDate != null
								? ([ "Last played ", HumanDateTime(DateTime.fromJSDate(game.lastPlayedDate), DateTime.DATE_MED) ])
								: null,
						};
					},
				});

			if (options.settings.showFavoritesGroup)
			{
				groupManager.addGroup("Favorites");
			}

			const sortedGames = games.toSorted((a, b) => a.sortName.localeCompare(b.sortName));

			for (const game of sortedGames)
			{
				if (options.settings.showFavoritesGroup && game.isFavorite)
				{
					groupManager.addItemToGroup("Favorites", game);
				}

				const groupName = GroupManager.getNameGroupName(game.sortName);

				groupManager.addItemToGroup(groupName, game);
			}

			return groupManager;
		}

		case "playTime":
		{
			const groupManager = new GroupManager<typeof games[0]>(
				{
					mapGroupModel: (game) =>
					{
						return {
							selected: game.id == options.selectedGame?.id,
							href: "/games/view/" + game.id,
							extraAtrributes:
							{
								"data-is-installed": game.isInstalled,
							},
							iconName: game.hasIconImage
								? staticMiddleware.getCacheBustedPath("/data/images/games/" + game.id + "/icon.jpg")
								: "fa-solid fa-gamepad-modern",
							name: game.name,
							info: game.playTimeTotalSeconds > 0
								? [ "Played ", shortEnglishHumanizer(game.playTimeTotalSeconds * 1000) ]
								: null,
						};
					},
				});

			if (options.settings.showFavoritesGroup)
			{
				groupManager.addGroup("Favorites");
			}

			const sortedGames = games.toSorted(
				(a, b) =>
				{
					if (a.playTimeTotalSeconds > b.playTimeTotalSeconds)
					{
						return -1;
					}

					if (a.playTimeTotalSeconds < b.playTimeTotalSeconds)
					{
						return 1;
					}

					return a.sortName.localeCompare(b.sortName);
				});

			for (const game of sortedGames)
			{
				if (options.settings.showFavoritesGroup && game.isFavorite)
				{
					groupManager.addItemToGroup("Favorites", game);
				}

				const playTimeTotalHours = game.playTimeTotalSeconds / 3600;

				if (playTimeTotalHours >= 1000)
				{
					groupManager.addItemToGroup("1000+ hours", game);
				}
				else if (playTimeTotalHours >= 750)
				{
					groupManager.addItemToGroup("750 to 1000 hours", game);
				}
				else if (playTimeTotalHours >= 500)
				{
					groupManager.addItemToGroup("500 to 750 hours", game);
				}
				else if (playTimeTotalHours >= 250)
				{
					groupManager.addItemToGroup("250 to 500 hours", game);
				}
				else if (playTimeTotalHours >= 100)
				{
					groupManager.addItemToGroup("100 to 250 hours", game);
				}
				else if (playTimeTotalHours >= 50)
				{
					groupManager.addItemToGroup("50 to 100 hours", game);
				}
				else if (playTimeTotalHours >= 10)
				{
					groupManager.addItemToGroup("10 to 50 hours", game);
				}
				else if (playTimeTotalHours >= 5)
				{
					groupManager.addItemToGroup("5 to 10 hours", game);
				}
				else if (playTimeTotalHours >= 4)
				{
					groupManager.addItemToGroup("4 to 5 hours", game);
				}
				else if (playTimeTotalHours >= 3)
				{
					groupManager.addItemToGroup("3 to 4 hours", game);
				}
				else if (playTimeTotalHours >= 2)
				{
					groupManager.addItemToGroup("2 to 3 hours", game);
				}
				else if (playTimeTotalHours >= 1)
				{
					groupManager.addItemToGroup("1 to 2 hours", game);
				}
				else if (playTimeTotalHours > 0)
				{
					groupManager.addItemToGroup("Under 1 hour", game);
				}
				else
				{
					groupManager.addItemToGroup("Unplayed", game);
				}
			}

			return groupManager;
		}

		case "publisher":
		{
			const groupManager = new GroupManager<typeof games[0]>(
				{
					sortGroups: (a, b) =>
					{
						if (b.sortOrder != a.sortOrder)
						{
							return b.sortOrder - a.sortOrder;
						}

						return a.name.localeCompare(b.name);
					},
					mapGroupModel: (game) =>
					{
						return {
							selected: game.id == options.selectedGame?.id,
							href: "/games/view/" + game.id,
							extraAtrributes:
							{
								"data-is-installed": game.isInstalled,
							},
							iconName: game.hasIconImage
								? staticMiddleware.getCacheBustedPath("/data/images/games/" + game.id + "/icon.jpg")
								: "fa-solid fa-gamepad-modern",
							name: game.name,
							info: game.lastPlayedDate != null
								? ([ "Last played ", HumanDateTime(DateTime.fromJSDate(game.lastPlayedDate), DateTime.DATE_MED) ])
								: null,
						};
					},
				});

			if (options.settings.showFavoritesGroup)
			{
				groupManager.addGroup("Favorites", 1);
			}

			groupManager.addGroup("-", -1);

			const sortedGames = games.toSorted((a, b) => a.sortName.localeCompare(b.sortName));

			for (const game of sortedGames)
			{
				if (options.settings.showFavoritesGroup && game.isFavorite)
				{
					groupManager.addItemToGroup("Favorites", game);
				}

				const gamePublishers = game.gameCompanies.filter((gameCompany) => gameCompany.type == "PUBLISHER");				

				if (gamePublishers.length > 0)
				{
					for (const gamePublisher of gamePublishers)
					{
						groupManager.addItemToGroup(gamePublisher.company.name, game);
					}
				}
				else
				{
					groupManager.addItemToGroup("-", game);
				}
			}

			return groupManager;
		}

		case "series":
		{
			const groupManager = new GroupManager<typeof games[0]>(
				{
					mapGroupModel: (game) =>
					{
						return {
							selected: game.id == options.selectedGame?.id,
							href: "/games/view/" + game.id,
							extraAtrributes:
							{
								"data-is-installed": game.isInstalled,
							},
							iconName: game.hasIconImage
								? staticMiddleware.getCacheBustedPath("/data/images/games/" + game.id + "/icon.jpg")
								: "fa-solid fa-gamepad-modern",
							name: game.name,
							info: game.lastPlayedDate != null
								? ([ "Last played ", HumanDateTime(DateTime.fromJSDate(game.lastPlayedDate), DateTime.DATE_MED) ])
								: null,
						};
					},
				});

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

			return groupManager;
		}

		case "steamDeckCompatibility":
		{
			const groupManager = new GroupManager<typeof games[0]>(
				{
					mapGroupModel: (game, group) =>
					{
						let info: Child = null;

						if (group.name == "Favorites")
						{
							if (game.steamAppId != null)
							{
								info = game.steamDeckCompatibility != null 
									? GameModelLib.getSteamDeckCompatibilityName(game.steamDeckCompatibility)
									: null;
							}
							else
							{
								info = "Non-Steam Game";
							}
						}

						return {
							selected: game.id == options.selectedGame?.id,
							href: "/games/view/" + game.id,
							extraAtrributes:
							{
								"data-is-installed": game.isInstalled,
							},
							iconName: game.hasIconImage
								? staticMiddleware.getCacheBustedPath("/data/images/games/" + game.id + "/icon.jpg")
								: "fa-solid fa-gamepad-modern",
							name: game.name,
							info,
						};
					},
				});

			if (options.settings.showFavoritesGroup)
			{
				groupManager.addGroup("Favorites");
			}

			groupManager.addGroup(GameModelLib.getSteamDeckCompatibilityName("VERIFIED"));

			groupManager.addGroup(GameModelLib.getSteamDeckCompatibilityName("PLAYABLE"));

			groupManager.addGroup(GameModelLib.getSteamDeckCompatibilityName("UNSUPPORTED"));

			groupManager.addGroup(GameModelLib.getSteamDeckCompatibilityName("UNKNOWN"));

			groupManager.addGroup("Non-Steam games");

			groupManager.addGroup("-");

			const sortedGames = games.toSorted((a, b) => a.sortName.localeCompare(b.sortName));

			for (const game of sortedGames)
			{
				if (options.settings.showFavoritesGroup && game.isFavorite)
				{
					groupManager.addItemToGroup("Favorites", game);
				}

				if (game.steamAppId == null)
				{
					groupManager.addItemToGroup("Non-Steam games", game);

					continue;
				}

				if (game.steamDeckCompatibility == null)
				{
					groupManager.addItemToGroup("-", game);

					continue;
				}

				groupManager.addItemToGroup(GameModelLib.getSteamDeckCompatibilityName(game.steamDeckCompatibility), game);
			}

			return groupManager;
		}
	}
}

//
// Utility Functions
//

export type AuditGame = Prisma.GameGetPayload<
	{
		include:
		{
			gameCompanies: true;
			gameEngines: true;
			gameGenres: true;
			gameInstallations: true;
			gameLinks: true;
			gamePlatforms: true;
			gamePlayActions: true;
			gamePlaySessions: true;
			seriesGames: true;
		},
	}>;

export async function audit(game: AuditGame, strictMode: boolean): Promise<AuditLib.ProblemList>
{
	//
	// Create Problem List
	//

	const problemList = new AuditLib.ProblemList(game.name, "/games/view/" + game.id, "/games/edit/" + game.id);

	//
	// Check Game
	//

	// General
	if (game.releaseDate == null && !game.isUnreleased)
	{
		problemList.addProblem("releaseDate is null but is isUnreleased is false", false);
	}

	if (game.releaseDate != null && game.isUnreleased)
	{
		// TODO: check if release date is in the future?
		problemList.addProblem("releaseDate is not null but isUnreleased is true", false);
	}

	if (game.description == null)
	{
		problemList.addProblem("description is null", false);
	}

	if (game.progressionType == null)
	{
		problemList.addProblem("progressionType is null", false);
	}

	// Images
	const imagePaths = getImagePaths(game);

	if (game.hasBannerImage && !fs.existsSync(imagePaths.banner))
	{
		problemList.addProblem("hasBannerImage is true but banner image does not exist on disk", false);
	}

	if (game.hasCoverImage && !fs.existsSync(imagePaths.cover))
	{
		problemList.addProblem("hasCoverImage is true but cover image does not exist on disk", false);
	}

	if (game.hasIconImage && !fs.existsSync(imagePaths.icon))
	{
		problemList.addProblem("hasIconImage is true but icon image does not exist on disk", false);
	}

	if (game.hasLogoImage)
	{
		if (!fs.existsSync(imagePaths.logo))
		{
			problemList.addProblem("hasLogoImage is true but logo image does not exist on disk", false);
		}

		if (game.logoImageAlignment == null)
		{
			problemList.addProblem("hasLogoImage is true but logoImageAlignment is null", false);
		}

		if (game.logoImageJustification == null)
		{
			problemList.addProblem("hasLogoImage is true but logoImageJustification is null", false);
		}

		// TODO: check logo image dimensions
	}

	// Play data
	if (game.completionStatus == null && game.progressionType != "NONE")
	{
		problemList.addProblem("completionStatus is null", false);
	}
	
	if (game.completionStatus == "TODO" && game.playCount > 0)
	{
		problemList.addProblem("completionStatus is TODO but playCount is greater than 0", false);
	}

	if (game.completionStatus == "TODO" && game.playTimeTotalSeconds > 0)
	{
		problemList.addProblem("completionStatus is TODO but playTimeTotalSeconds is greater than 0", false);
	}

	if (game.playCount == 0 && game.playTimeTotalSeconds > 0)
	{
		problemList.addProblem("playCount is 0 but playTimeTotalSeconds is greater than 0", false);
	}

	// Features
	if (game.achievementSupport == null)
	{
		problemList.addProblem("achievementSupport is null", false);
	}

	if (game.controllerSupport == null)
	{
		problemList.addProblem("controllerSupport is null", false);
	}

	// Note: It's tricky to determine what I consider a game's mod support to be,
	//	so I readded the concept of "strict mode" to check it only sometimes.
	if (strictMode && game.modSupport == null)
	{
		problemList.addProblem("modSupport is null", true);
	}

	if (game.virtualRealitySupport == null)
	{
		problemList.addProblem("virtualRealitySupport is null", false);
	}

	// Steam app
	if (game.steamAppId != null)
	{
		if (game.steamAppName == null)
		{
			problemList.addProblem("steamAppId is not null but steamAppName is null", false);
		}

		if (game.steamDeckCompatibility == null)
		{
			problemList.addProblem("steamAppId is not null but steamDeckCompatibility is null", false);
		}
	}

	//
	// Check Game Companies
	//

	const gameDevelopers = game.gameCompanies.filter((gameCompany) => gameCompany.type == "DEVELOPER");

	if (gameDevelopers.length == 0)
	{
		problemList.addProblem("no GameCompany relations with DEVELOPER type", false);
	}

	const gamePublishers = game.gameCompanies.filter((gameCompany) => gameCompany.type == "PUBLISHER");

	if (gamePublishers.length == 0)
	{
		problemList.addProblem("no GameCompany relations with PUBLISHER type", false);
	}

	//
	// Check Game Engines
	//

	if (game.isUnknownEngine && game.gameEngines.length > 0)
	{
		problemList.addProblem("isUnknownEngine is true but there are GameEngine relations", false);
	}

	if (!game.isUnknownEngine && game.gameEngines.length == 0)
	{
		problemList.addProblem("isUnknownEngine is false but there are no GameEngine relations", false);
	}

	//
	// Check Game Installations
	//

	if (game.isInstalled && game.gameInstallations.length == 0)
	{
		problemList.addProblem("isInstalled is true but there are no GameInstallation relations", false);
	}

	if (!game.isInstalled && game.gameInstallations.length > 0)
	{
		problemList.addProblem("isInstalled is false but there are GameInstallation relations", false);
	}

	for (const gameInstallation of game.gameInstallations)
	{
		if (fs.existsSync(gameInstallation.path))
		{
			continue;
		}

		problemList.addProblem("gameInstallation #" + gameInstallation.id + ": path does not exist: " + gameInstallation.path, false);
	}

	//
	// Check Game Platforms
	//

	if (game.gamePlatforms.length == 0)
	{
		problemList.addProblem("no gamePlatforms", false);
	}

	//
	// Check Game Play Actions
	//

	if (game.isInstalled && game.gamePlayActions.length == 0)
	{
		problemList.addProblem("isInstalled is true but there are no GamePlayAction relations", false);
	}

	if (!game.isInstalled && game.gamePlayActions.length > 0)
	{
		problemList.addProblem("isInstalled is false but there are GamePlayAction relations", false);
	}

	for (const gamePlayAction of game.gamePlayActions)
	{
		switch (gamePlayAction.type)
		{
			case "EXECUTABLE":
			{
				if (gamePlayAction.workingDirectory == null)
				{
					problemList.addProblem("gamePlayAction #" + gamePlayAction.id + ": type is EXECUTABLE but workingDirectory is null", false);
				}

				if (gamePlayAction.argumentsJson != null)
				{
					const additionalArgumentsParseResult = z.array(z.string()).safeParse(gamePlayAction.argumentsJson);
	
					if (!additionalArgumentsParseResult.success)
					{
						problemList.addProblem("gamePlayAction #" + gamePlayAction.id + ": type is EXECUTABLE but additionalArguments is not a string array", false);
					}
				}

				break;
			}

			case "URL":
			{
				if (!URL.canParse(gamePlayAction.path))
				{
					problemList.addProblem("gamePlayAction #" + gamePlayAction.id + ": type is URL but path is not a valid URL", false);
				}

				break;
			}
		}
	}

	//
	// Check Game Play Sessions
	//

	let playTimeTotalSeconds = 0;

	for (const gamePlaySession of game.gamePlaySessions)
	{
		playTimeTotalSeconds += gamePlaySession.playTimeSeconds;
	}

	if (game.playTimeTotalSeconds != playTimeTotalSeconds)
	{
		const difference = game.playTimeTotalSeconds - playTimeTotalSeconds;

		problemList.addProblem("playTimeTotalSeconds is " + game.playTimeTotalSeconds + " but sum of GamePlaySession relations is " + playTimeTotalSeconds + " (difference: " + difference + ")", false);
	}

	//
	// Return Problem List
	//

	return problemList;
}

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

export function getProgressionTypeName(gameOrProgressionType: Prisma.GameGetPayload<null> | GameProgressionType)
{
	if (typeof gameOrProgressionType == "string")
	{
		return progressionTypeNames[gameOrProgressionType];
	}

	return gameOrProgressionType.progressionType != null
		? progressionTypeNames[gameOrProgressionType.progressionType]
		: "-";
}

export function getLogoImageAlignmentName(gameOrLogoImageAlignment: Prisma.GameGetPayload<null> | GameLogoImageAlignment)
{
	if (typeof gameOrLogoImageAlignment == "string")
	{
		return logoImageAlignmentNames[gameOrLogoImageAlignment];
	}

	return gameOrLogoImageAlignment.logoImageAlignment != null
		? logoImageAlignmentNames[gameOrLogoImageAlignment.logoImageAlignment]
		: "-";
}

export function getLogoImageJustificationName(gameOrLogoImageJustification: Prisma.GameGetPayload<null> | GameLogoImageJustification)
{
	if (typeof gameOrLogoImageJustification == "string")
	{
		return logoImageJustificationNames[gameOrLogoImageJustification];
	}

	return gameOrLogoImageJustification.logoImageJustification != null
		? logoImageJustificationNames[gameOrLogoImageJustification.logoImageJustification]
		: "-";
}

export function getCompletionStatusIconName(gameOrCompletionStatus: Prisma.GameGetPayload<null> | GameCompletionStatus)
{
	if (typeof gameOrCompletionStatus == "string")
	{
		return completionStatusIconNames[gameOrCompletionStatus];
	}

	// HACK: this is not *really* a GameCompletionStatus
	if (gameOrCompletionStatus.isShelved)
	{
		return "fa-solid fa-circle-pause";
	}

	return gameOrCompletionStatus.completionStatus != null
		? completionStatusIconNames[gameOrCompletionStatus.completionStatus]
		: "fa-solid fa-question";
}

export function getCompletionStatusName(gameOrCompletionStatus: Prisma.GameGetPayload<null> | GameCompletionStatus)
{
	if (typeof gameOrCompletionStatus == "string")
	{
		return completionStatusNames[gameOrCompletionStatus];
	}

	// HACK: this is not *really* a GameCompletionStatus
	if (gameOrCompletionStatus.isShelved)
	{
		return "Shelved";
	}

	return gameOrCompletionStatus.completionStatus != null
		? completionStatusNames[gameOrCompletionStatus.completionStatus]
		: "-";
}

export function getAchievementSupportName(gameOrAchievementSupport: Prisma.GameGetPayload<null> | GameAchievementSupport)
{
	if (typeof gameOrAchievementSupport == "string")
	{
		return achievementSupportNames[gameOrAchievementSupport];
	}

	return gameOrAchievementSupport.achievementSupport != null
		? achievementSupportNames[gameOrAchievementSupport.achievementSupport]
		: "-";
}

export function getControllerSupportName(gameOrControllerSupport: Prisma.GameGetPayload<null> | GameControllerSupport)
{
	if (typeof gameOrControllerSupport == "string")
	{
		return controllerSupportNames[gameOrControllerSupport];
	}

	return gameOrControllerSupport.controllerSupport != null
		? controllerSupportNames[gameOrControllerSupport.controllerSupport]
		: "-";
}

export function getModSupportName(gameOrModSupport: Prisma.GameGetPayload<null> | GameModSupport)
{
	if (typeof gameOrModSupport == "string")
	{
		return modSupportNames[gameOrModSupport];
	}

	return gameOrModSupport.modSupport != null
		? modSupportNames[gameOrModSupport.modSupport]
		: "-";
}

export function getVirtualRealitySupportName(gameOrVirtualRealitySupport: Prisma.GameGetPayload<null> | GameVirtualRealitySupport)
{
	if (typeof gameOrVirtualRealitySupport == "string")
	{
		return virtualRealitySupportNames[gameOrVirtualRealitySupport];
	}

	return gameOrVirtualRealitySupport.virtualRealitySupport != null
		? virtualRealitySupportNames[gameOrVirtualRealitySupport.virtualRealitySupport]
		: "-";
}

export function getSteamDeckCompatibilityIconName(gameOrSteamDeckCompatibility: Prisma.GameGetPayload<null> | GameSteamDeckCompatibility)
{
	if (typeof gameOrSteamDeckCompatibility == "string")
	{
		return steamDeckCompatibilityIconNames[gameOrSteamDeckCompatibility];
	}

	return gameOrSteamDeckCompatibility.steamDeckCompatibility != null
		? steamDeckCompatibilityIconNames[gameOrSteamDeckCompatibility.steamDeckCompatibility]
		: "fa-solid fa-question";
}

export function getSteamDeckCompatibilityName(gameOrSteamDeckCompatibility: Prisma.GameGetPayload<null> | GameSteamDeckCompatibility)
{
	if (typeof gameOrSteamDeckCompatibility == "string")
	{
		return steamDeckCompatibilityNames[gameOrSteamDeckCompatibility];
	}

	return gameOrSteamDeckCompatibility.steamDeckCompatibility != null
		? steamDeckCompatibilityNames[gameOrSteamDeckCompatibility.steamDeckCompatibility]
		: "-";
}

export function hasActiveSession(game: Prisma.GameGetPayload<null>)
{
	return GamePlaySessionModelLib.gamesWithActiveSessions.has(game.id);
}