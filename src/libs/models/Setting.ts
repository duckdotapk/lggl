//
// Imports
//

import { Prisma } from "@prisma/client";

import * as SettingSchemaLib from "../schemas/Setting.js";

//
// Class
//

export class Settings
{
	groupMode: SettingSchemaLib.GroupMode = "lastPlayed";

	showFavoritesGroup: SettingSchemaLib.ShowFavoritesGroup = true;

	showVisibleGames: SettingSchemaLib.ShowVisibleGames = true;

	showHiddenGames: SettingSchemaLib.ShowHiddenGames = false;

	showNsfwGames: SettingSchemaLib.ShowNsfwGames = false;

	constructor(settings: Prisma.SettingGetPayload<null>[])
	{
		for (const setting of settings)
		{
			switch (setting.name)
			{
				case "groupMode":
				{
					const valueParseResult = SettingSchemaLib.GroupModeSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.groupMode = valueParseResult.data;
					}

					break;
				}

				case "showFavoritesGroup":
				{
					const valueParseResult = SettingSchemaLib.ShowFavoritesGroupSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.showFavoritesGroup = valueParseResult.data;
					}

					break;
				}

				case "showVisibleGames":
				{
					const valueParseResult = SettingSchemaLib.ShowVisibleGamesSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.showVisibleGames = valueParseResult.data;
					}

					break;
				}

				case "showHiddenGames":
				{
					const valueParseResult = SettingSchemaLib.ShowHiddenGamesSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.showHiddenGames = valueParseResult.data;
					}

					break;
				}

				case "showNsfwGames":
				{
					const valueParseResult = SettingSchemaLib.ShowNsfwGamesSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.showNsfwGames = valueParseResult.data;
					}

					break;
				}
			}
		}
	}
}

//
// Create/Find/Update/Delete Functions
//

export async function getSettings(transactionClient: Prisma.TransactionClient)
{
	const settings = await transactionClient.setting.findMany();

	return new Settings(settings);
}