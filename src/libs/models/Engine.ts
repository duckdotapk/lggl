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
	selectedEngine: Prisma.EngineGetPayload<null> | null;
};

export async function findGroups(transactionClient: Prisma.TransactionClient, options: FindGroupsOptions)
{
	const engines = await transactionClient.engine.findMany(
		{
			include:
			{
				gameEngines: true,
			},
		});

	const groupManager = new GroupManager<typeof engines[0]>(
		{
			mapGroupModel: (engine) =>
			{
				return {
					selected: engine.id == options.selectedEngine?.id,
					href: "/engines/view/" + engine.id,
					iconName: "fa-solid fa-engine",
					name: engine.name,
					info: "Last updated " + DateTime.fromJSDate(engine.lastUpdatedDate).toLocaleString(DateTime.DATE_MED),
				};
			},
		});

	switch (options.settings.engineGroupMode)
	{
		case "name":
		{
			const sortedEngines = engines.toSorted((a, b) => a.name.localeCompare(b.name));

			for (const engine of sortedEngines)
			{
				const groupName = GroupManager.getNameGroupName(engine.name);
		
				groupManager.addItemToGroup(groupName, engine);
			}

			break;
		}

		case "numberOfGames":
		{
			const sortedEngines = engines.toSorted((a, b) => b.gameEngines.length - a.gameEngines.length);

			for (const engine of sortedEngines)
			{
				const groupName = engine.gameEngines.length + " game" + (engine.gameEngines.length == 1 ? "" : "s");

				groupManager.addItemToGroup(groupName, engine);
			}

			break;
		}
	}

	return groupManager;
}