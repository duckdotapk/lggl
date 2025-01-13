//
// Imports
//

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { GroupManager } from "../../classes/GroupManager.js";

import * as SettingModelLib from "../models/Setting.js";

//
// Create/Find/Update/Delete Functions
//

export type FindGroupsOptions =
{
	settings: SettingModelLib.Settings;
	selectedPlatform: Prisma.PlatformGetPayload<null> | null;
};

export async function findGroups(transactionClient: Prisma.TransactionClient, options: FindGroupsOptions)
{
	const platforms = await transactionClient.platform.findMany();

	const groupManager = new GroupManager<typeof platforms[0]>(
		(platform) =>
		{
			return {
				selected: platform.id == options.selectedPlatform?.id,
				href: "/platforms/view/" + platform.id,
				iconName: platform.iconName,
				name: platform.name,
				info: "Last updated " + DateTime.fromJSDate(platform.lastUpdatedDate).toLocaleString(DateTime.DATE_MED),
			};
		});

	switch (options.settings.platformGroupMode)
	{
		case "name":
		{
			const sortedPlatforms = platforms.toSorted((a, b) => a.name.localeCompare(b.name));

			for (const platform of sortedPlatforms)
			{
				const groupName = GroupManager.getNameGroupName(platform.name);
		
				groupManager.addItemToGroup(groupName, platform);
			}

			break;
		}
	}

	return groupManager;
}