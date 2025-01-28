//
// Imports
//

import fs from "node:fs";
import path from "node:path";

import { GameAchievementSupport, GameCompletionStatus, GameControllerSupport, GameLogoImageAlignment, GameLogoImageJustification, GameModSupport, GameProgressionType, GameSteamDeckCompatibility, GameVirtualRealitySupport, Prisma } from "@prisma/client";
import { z } from "zod";

import { CompletionStatusGameGroupManager, CreatedDateGameGroupManager, DeveloperGameGroupManager, EngineGameGroupManager, FirstCompletedDateGameGroupManager, FirstPlayedDateGameGroupManager, LastPlayedDateGameGroupManager, NameGameGroupManager, PlayTimeTotalSecondsGameGroupManager, PublisherGameGroupManager, SeriesGameGroupManager, SteamDeckCompatibilityGameGroupManager } from "../../classes/GameGroupManager.js";

import { LGGL_DATA_DIRECTORY } from "../../env/LGGL_DATA_DIRECTORY.js";

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

export async function createGroupManager(transactionClient: Prisma.TransactionClient, settings: SettingModelLib.Settings, selectedGame: Prisma.GameGetPayload<null> | null)
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

	switch (settings.gameGroupMode)
	{
		case "completionStatus":
			return new CompletionStatusGameGroupManager(settings, games, selectedGame);

		case "createdDate":
			return new CreatedDateGameGroupManager(settings, games, selectedGame);

		case "developer":
			return new DeveloperGameGroupManager(settings, games, selectedGame);

		case "engine":
			return new EngineGameGroupManager(settings, games, selectedGame);

		case "firstCompletedDate":
			return new FirstCompletedDateGameGroupManager(settings, games, selectedGame);

		case "firstPlayedDate":
			return new FirstPlayedDateGameGroupManager(settings, games, selectedGame);

		case "lastPlayedDate":
			return new LastPlayedDateGameGroupManager(settings, games, selectedGame);

		case "name":
			return new NameGameGroupManager(settings, games, selectedGame);

		case "playTime":
			return new PlayTimeTotalSecondsGameGroupManager(settings, games, selectedGame);

		case "publisher":
			return new PublisherGameGroupManager(settings, games, selectedGame);

		case "series":
			return new SeriesGameGroupManager(settings, games, selectedGame);

		case "steamDeckCompatibility":
			return new SteamDeckCompatibilityGameGroupManager(settings, games, selectedGame);
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
			gameInstallations:
			{
				include:
				{
					directory: true;
				};
			};
			gameLinks: true;
			gamePlatforms: true;
			gamePlayActions: true;
			gamePlaySessions: true;
			seriesGames: true;
		};
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

	if (game.hasBannerImage)
	{
		if (!fs.existsSync(imagePaths.banner))
		{
			problemList.addProblem("hasBannerImage is true but banner image does not exist on disk", false);
		}
	}
	else
	{
		if (fs.existsSync(imagePaths.banner))
		{
			problemList.addProblem("hasBannerImage is false but banner image exists on disk", false);
		}
	}

	if (game.hasCoverImage)
	{
		if (!fs.existsSync(imagePaths.cover))
		{
			problemList.addProblem("hasCoverImage is true but cover image does not exist on disk", false);
		}
	}
	else
	{
		if (fs.existsSync(imagePaths.cover))
		{
			problemList.addProblem("hasCoverImage is false but cover image exists on disk", false);
		}
	}

	if (game.hasIconImage)
	{
		if (!fs.existsSync(imagePaths.icon))
		{
			problemList.addProblem("hasIconImage is true but icon image does not exist on disk", false);
		}
	}
	else
	{
		if (fs.existsSync(imagePaths.icon))
		{
			problemList.addProblem("hasIconImage is false but icon image exists on disk", false);
		}
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
	else
	{
		if (fs.existsSync(imagePaths.logo))
		{
			problemList.addProblem("hasLogoImage is false but logo image exists on disk", false);
		}
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
		const gameInstallationFullPath = path.normalize(path.join(gameInstallation.directory.path, gameInstallation.path));

		if (fs.existsSync(gameInstallationFullPath))
		{
			continue;
		}

		problemList.addProblem("gameInstallation #" + gameInstallation.id + ": full path does not exist: " + gameInstallationFullPath, false);
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
				if (gamePlayAction.workingDirectory != null && !fs.existsSync(gamePlayAction.workingDirectory))
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