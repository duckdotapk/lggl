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
	selectedSeries: Prisma.PlatformGetPayload<null> | null;
};

export async function findGroups(transactionClient: Prisma.TransactionClient, options: FindGroupsOptions)
{
	const series = await transactionClient.series.findMany(
		{
			include:
			{
				seriesGames: true,
			},
		});

	const groupManager = new GroupManager<typeof series[0]>(
		{
			mapGroupModel: (series) =>
			{
				return {
					selected: series.id == options.selectedSeries?.id,
					href: "/platforms/view/" + series.id,
					iconName: "fa-solid fa-list-timeline",
					name: series.name,
					info: "Last updated " + DateTime.fromJSDate(series.lastUpdatedDate).toLocaleString(DateTime.DATE_MED),
				};
			},
		});

	switch (options.settings.seriesGroupMode)
	{
		case "name":
		{
			const sortedPlatforms = series.toSorted((a, b) => a.name.localeCompare(b.name));

			for (const platform of sortedPlatforms)
			{
				const groupName = GroupManager.getNameGroupName(platform.name);
		
				groupManager.addItemToGroup(groupName, platform);
			}

			break;
		}

		case "numberOfGames":
		{
			const sortedPlatforms = series.toSorted(
				(a, b) =>
				{
					if (a.seriesGames.length != b.seriesGames.length)
					{
						return b.seriesGames.length - a.seriesGames.length;
					}

					return a.name.localeCompare(b.name);
				});

			for (const platform of sortedPlatforms)
			{
				const groupName = platform.seriesGames.length + " game" + (platform.seriesGames.length == 1 ? "" : "s");

				groupManager.addItemToGroup(groupName, platform);
			}

			break;
		}
	}

	return groupManager;
}