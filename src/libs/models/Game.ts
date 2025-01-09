//
// Imports
//

import path from "node:path";

import { Prisma } from "@prisma/client";

import { LGGL_DATA_DIRECTORY } from "../../env/LGGL_DATA_DIRECTORY.js";

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