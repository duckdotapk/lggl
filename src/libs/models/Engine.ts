//
// Imports
//

import { Prisma } from "@prisma/client";

import { NameEngineGroupManager, NumberOfGamesEngineGroupManager } from "../../classes/EngineGroupManager.js";

import * as SettingModelLib from "../models/Setting.js";

//
// Create/Find/Update/Delete Functions
//

export async function createGroupManager(transactionClient: Prisma.TransactionClient, settings: SettingModelLib.Settings, selectedEngine: Prisma.EngineGetPayload<null> | null)
{
	const engines = await transactionClient.engine.findMany(
		{
			include:
			{
				gameEngines: true,
			},
		});

	switch (settings.engineGroupMode)
	{
		case "name":
			return new NameEngineGroupManager(settings, engines, selectedEngine);

		case "numberOfGames":
			return new NumberOfGamesEngineGroupManager(settings, engines, selectedEngine);
	}
}