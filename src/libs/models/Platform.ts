//
// Imports
//

import { Prisma } from "@prisma/client";

import { NamePlatformGroupManager, NumberOfGamesPlatformGroupManager } from "../../classes/PlatformGroupManager.js";

import * as SettingModelLib from "../models/Setting.js";

//
// Create/Find/Update/Delete Functions
//

export async function createGroupManager(transactionClient: Prisma.TransactionClient, settings: SettingModelLib.Settings, selectedPlatform: Prisma.PlatformGetPayload<null> | null)
{
	const platforms = await transactionClient.platform.findMany(
		{
			include:
			{
				gamePlatforms: true,
			},
		});

	switch (settings.platformGroupMode)
	{
		case "name":
			return new NamePlatformGroupManager(settings, platforms, selectedPlatform);

		case "numberOfGames":
			return new NumberOfGamesPlatformGroupManager(settings, platforms, selectedPlatform);
	}
}