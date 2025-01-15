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
	gameGroupMode: SettingSchemaLib.GameGroupMode = "lastPlayed";
	showFavoritesGroup: SettingSchemaLib.ShowFavoritesGroup = true;
	showVisibleGames: SettingSchemaLib.ShowVisibleGames = true;
	showHiddenGames: SettingSchemaLib.ShowHiddenGames = false;
	showNsfwGames: SettingSchemaLib.ShowNsfwGames = false;

	companyGroupMode: SettingSchemaLib.CompanyGroupMode = "name";

	engineGroupMode: SettingSchemaLib.EngineGroupMode = "name";

	platformGroupMode: SettingSchemaLib.PlatformGroupMode = "name";

	constructor(settings: Prisma.SettingGetPayload<null>[])
	{
		for (const setting of settings)
		{
			switch (setting.name)
			{
				case "gameGroupMode":
				{
					const valueParseResult = SettingSchemaLib.GameGroupModeSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.gameGroupMode = valueParseResult.data;
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

				case "companyGroupMode":
				{
					const valueParseResult = SettingSchemaLib.CompanyGroupModeSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.companyGroupMode = valueParseResult.data;
					}

					break;
				}

				case "engineGroupMode":
				{
					const valueParseResult = SettingSchemaLib.EngineGroupModeSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.engineGroupMode = valueParseResult.data;
					}

					break;
				}

				case "platformGroupMode":
				{
					const valueParseResult = SettingSchemaLib.PlatformGroupModeSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.platformGroupMode = valueParseResult.data;
					}

					break;
				}
			}
		}
	}
}

//
// Constants
//

const gameGroupModeNames: Record<SettingSchemaLib.GameGroupMode, string> =
{
	developer: "Developer",
	engine: "Engine",
	lastPlayed: "Last played",
	name: "Name",
	playTime: "Play time",
	publisher: "Publisher",
	series: "Series",
};

//
// Create/Find/Update/Delete Functions
//

export async function getSettings(transactionClient: Prisma.TransactionClient)
{
	const settings = await transactionClient.setting.findMany();

	return new Settings(settings);
}

export function getGameGroupModeName(gameGroupMode: SettingSchemaLib.GameGroupMode)
{
	return gameGroupModeNames[gameGroupMode];
}