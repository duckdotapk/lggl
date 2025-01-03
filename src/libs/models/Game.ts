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

export function getCompletionStatusName(game: Prisma.GameGetPayload<null>)
{
	if (game.completionStatus == null)
	{
		return "-";
	}

	const completionStatusParseResult = GameSchemaLib.CompletionStatusSchema.safeParse(game.completionStatus);

	return completionStatusParseResult.success
		? completionStatusNames[completionStatusParseResult.data]
		: "Invalid: " + game.completionStatus;
}

export function getProgressionTypeName(game: Prisma.GameGetPayload<null>)
{
	if (game.progressionType == null)
	{
		return "-";
	}

	const progressionTypeParseResult = GameSchemaLib.ProgressionTypeSchema.safeParse(game.progressionType);

	return progressionTypeParseResult.success
		? progressionTypeNames[progressionTypeParseResult.data]
		: "Invalid: " + game.progressionType;
}

export function getAchievementSupportName(game: Prisma.GameGetPayload<null>)
{
	if (game.achievementSupport == null)
	{
		return "-";
	}

	const achievementSupportParseResult = GameSchemaLib.AchievementSupportSchema.safeParse(game.achievementSupport);

	return achievementSupportParseResult.success
		? achievementSupportNames[achievementSupportParseResult.data]
		: "Invalid: " + game.achievementSupport;
}

export function getControllerSupportName(game: Prisma.GameGetPayload<null>)
{
	if (game.controllerSupport == null)
	{
		return "-";
	}

	const controllerSupportParseResult = GameSchemaLib.ControllerSupportSchema.safeParse(game.controllerSupport);

	return controllerSupportParseResult.success
		? controllerSupportNames[controllerSupportParseResult.data]
		: "Invalid: " + game.controllerSupport;
}

export function getModSupportName(game: Prisma.GameGetPayload<null>)
{
	if (game.modSupport == null)
	{
		return "-";
	}

	const modSupportParseResult = GameSchemaLib.ModSupportSchema.safeParse(game.modSupport);

	return modSupportParseResult.success
		? modSupportNames[modSupportParseResult.data]
		: "Invalid: " + game.modSupport;
}

export function getVirtualRealitySupportName(game: Prisma.GameGetPayload<null>)
{
	if (game.virtualRealitySupport == null)
	{
		return "-";
	}

	const virtualRealitySupportParseResult = GameSchemaLib.VirtualRealitySupportSchema.safeParse(game.virtualRealitySupport);

	return virtualRealitySupportParseResult.success
		? virtualRealitySupportNames[virtualRealitySupportParseResult.data]
		: "Invalid: " + game.virtualRealitySupport;
}