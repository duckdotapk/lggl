//
// Imports
//

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { ListLayoutOptions } from "../../components/layout/ListLayout.js";

import * as SettingSchemaLib from "../schemas/Setting.js";

//
// Create/Find/Update/Delete Functions
//

export type FindGroupsMode = "name";

export type FindGroupsOptions =
{
	mode: SettingSchemaLib.PlatformGroupMode;
	selectedPlatform: Prisma.PlatformGetPayload<null> | null;
};

export async function findGroups(transactionClient: Prisma.TransactionClient, options: FindGroupsOptions)
{
	const platforms = await transactionClient.platform.findMany(
		{
			orderBy:
			[
				{ name: "asc" },
			],
		});

	const groupsMap = new Map<string, ListLayoutOptions["groups"][0]>();

	switch (options.mode)
	{
		case "name":
		{
			for (const platform of platforms)
			{
				const charCode = platform.name.toUpperCase().charCodeAt(0);
		
				let groupName: string;
		
				if (charCode >= 48 && charCode <= 57)
				{
					groupName = "#";
				}
				else if (charCode >= 65 && charCode <= 90)
				{
					groupName = platform.name[0]!.toUpperCase();
				}
				else
				{
					groupName = "?";
				}
		
				const platformGroup = groupsMap.get(groupName) ?? { name: groupName, items: [] };
				
				platformGroup.items.push(
					{
						selected: platform.id == options.selectedPlatform?.id,
						href: "/platforms/view/" + platform.id,
						iconName: platform.iconName,
						name: platform.name,
						info: "Last updated " + DateTime.fromJSDate(platform.lastUpdatedDate).toLocaleString(DateTime.DATE_MED),
					});
		
				groupsMap.set(groupName, platformGroup);
			}

			break;
		}
	}

	const groups = Array.from(groupsMap.values());

	return groups;
}