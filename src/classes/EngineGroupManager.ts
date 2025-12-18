//
// Imports
//

import util from "node:util";

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { GroupManager } from "./GroupManager.js";

import { HumanDateTime } from "../components/basic/HumanDateTime.js";

//
// Class
//

export abstract class EngineGroupManager<T extends Prisma.EngineGetPayload<null> = Prisma.EngineGetPayload<null>> extends GroupManager<T>
{
	override getItemHref(engine: T)
	{
		return "/engines/view/" + engine.id;
	}

	override getItemIconName(_engine: T)
	{
		return "fa-solid fa-engine";
	}

	override getItemName(engine: T)
	{
		return engine.name;
	}

	override getItemInfo(engine: T)
	{
		return [
			"Last updated ",
			HumanDateTime(DateTime.fromJSDate(engine.lastUpdatedDate)),
		];
	}
}

export class NameEngineGroupManager extends EngineGroupManager
{
	override sortModels(engines: Prisma.EngineGetPayload<null>[])
	{
		return engines.toSorted((a, b) => a.name.localeCompare(b.name));
	}

	override groupModels(engines: Prisma.EngineGetPayload<null>[])
	{
		for (const engine of engines)
		{
			const groupName = GroupManager.getNameGroupName(engine.name);

			this.addModelToGroup(groupName, engine);
		}

		return Array.from(this.groupsByName.values());
	}
}

export type NumberOfGamesEngineGroupManagerEngine = Prisma.EngineGetPayload<
{
	include:
	{
		gameEngines: true;
	};
}>;

export class NumberOfGamesEngineGroupManager extends EngineGroupManager<NumberOfGamesEngineGroupManagerEngine>
{
	override sortModels(engines: NumberOfGamesEngineGroupManagerEngine[])
	{
		return engines.toSorted((a, b) =>
		{
			if (a.gameEngines.length > b.gameEngines.length)
			{
				return -1;
			}

			if (a.gameEngines.length < b.gameEngines.length)
			{
				return 1;
			}

			return a.name.localeCompare(b.name);
		});
	}

	override groupModels(engines: NumberOfGamesEngineGroupManagerEngine[])
	{
		for (const engine of engines)
		{
			const groupName = util.format(
				"%d game%s",
				engine.gameEngines.length,
				engine.gameEngines.length == 1 ? "" : "s",
			);

			this.addModelToGroup(groupName, engine);
		}

		return Array.from(this.groupsByName.values());
	}
}