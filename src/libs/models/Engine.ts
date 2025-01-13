//
// Imports
//

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { ListLayoutOptions } from "../../components/layout/ListLayout.js";

import * as SettingSchemaLib from "../../libs/schemas/Setting.js";

//
// Create/Find/Update/Delete Functions
//

export type FindGroupsOptions =
{
	mode: SettingSchemaLib.EngineGroupMode;
	selectedEngine: Prisma.EngineGetPayload<null> | null;
};

export async function findGroups(transactionClient: Prisma.TransactionClient, options: FindGroupsOptions)
{
	const engines = await transactionClient.engine.findMany(
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
			for (const engine of engines)
			{
				const charCode = engine.name.toUpperCase().charCodeAt(0);
		
				let groupName: string;
		
				if (charCode >= 48 && charCode <= 57)
				{
					groupName = "#";
				}
				else if (charCode >= 65 && charCode <= 90)
				{
					groupName = engine.name[0]!.toUpperCase();
				}
				else
				{
					groupName = "?";
				}
		
				const engineGroup = groupsMap.get(groupName) ?? { name: groupName, items: [] };
				
				engineGroup.items.push(
					{
						selected: engine.id == options.selectedEngine?.id,
						href: "/engines/view/" + engine.id,
						iconName: "fa-solid fa-engine",
						name: engine.name,
						info: "Last updated " + DateTime.fromJSDate(engine.lastUpdatedDate).toLocaleString(DateTime.DATE_MED),
					});
		
				groupsMap.set(groupName, engineGroup);
			}

			break;
		}
	}

	const groups = Array.from(groupsMap.values());

	return groups;
}