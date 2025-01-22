//
// Imports
//

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { GroupManager } from "./GroupManager.js";

import { HumanDateTime } from "../components/basic/HumanDateTime.js";

//
// Class
//

export abstract class PlatformGroupManager<T extends Prisma.PlatformGetPayload<null> = Prisma.PlatformGetPayload<null>> extends GroupManager<T>
{
	override getItemHref(platform: T)
	{
		return "/platforms/view/" + platform.id;
	}

	override getItemIconName(_platform: T)
	{
		return "fa-solid fa-layer-group";
	}

	override getItemName(platform: T)
	{
		return platform.name;
	}

	override getItemInfo(platform: T)
	{
		return [ "Last updated ", HumanDateTime(DateTime.fromJSDate(platform.lastUpdatedDate)) ];
	}
}

export class NamePlatformGroupManager extends PlatformGroupManager
{
	override sortModels(platforms: Prisma.PlatformGetPayload<null>[])
	{
		return platforms.toSorted((a, b) => a.name.localeCompare(b.name));
	}

	override groupModels(platforms: Prisma.PlatformGetPayload<null>[])
	{
		for (const platform of platforms)
		{
			const groupName = GroupManager.getNameGroupName(platform.name);

			this.addModelToGroup(groupName, platform);
		}

		return Array.from(this.groupsByName.values());
	}
}

export type NumberOfGamesPlatformGroupManagerPlatform = Prisma.PlatformGetPayload<{ include: { gamePlatforms: true } }>;

export class NumberOfGamesPlatformGroupManager extends PlatformGroupManager<NumberOfGamesPlatformGroupManagerPlatform>
{
	override sortModels(platforms: NumberOfGamesPlatformGroupManagerPlatform[])
	{
		return platforms.toSorted((a, b) => b.gamePlatforms.length - a.gamePlatforms.length);
	}

	override groupModels(platforms: NumberOfGamesPlatformGroupManagerPlatform[])
	{
		for (const platform of platforms)
		{
			const groupName = platform.gamePlatforms.length + " game" + (platform.gamePlatforms.length == 1 ? "" : "s");

			this.addModelToGroup(groupName, platform);
		}

		return Array.from(this.groupsByName.values());
	}
}