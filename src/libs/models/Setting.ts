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
	gameGroupMode: SettingSchemaLib.GameGroupMode = "lastPlayedDate";
	showFavoritesGroup: SettingSchemaLib.ShowFavoritesGroup = true;
	showRegularGames: SettingSchemaLib.ShowRegularGames = true;
	showHiddenGames: SettingSchemaLib.ShowHiddenGames = false;
	showNsfwGames: SettingSchemaLib.ShowNsfwGames = false;

	companyGroupMode: SettingSchemaLib.CompanyGroupMode = "name";

	engineGroupMode: SettingSchemaLib.EngineGroupMode = "name";

	platformGroupMode: SettingSchemaLib.PlatformGroupMode = "name";

	seriesGroupMode: SettingSchemaLib.SeriesGroupMode = "name";

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

				case "showRegularGames":
				{
					const valueParseResult = SettingSchemaLib.ShowRegularGamesSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.showRegularGames = valueParseResult.data;
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

				case "seriesGroupMode":
				{
					const valueParseResult = SettingSchemaLib.SeriesGroupModeSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.seriesGroupMode = valueParseResult.data;
					}

					break
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
	completionStatus: "Completion status",
	createdDate: "Created date",
	developer: "Developer",
	engine: "Engine",
	lastPlayedDate: "Last played date",
	name: "Name",
	playTime: "Play time",
	publisher: "Publisher",
	series: "Series",
};

const companyGroupModeNames: Record<SettingSchemaLib.CompanyGroupMode, string> =
{
	name: "Name",
	numberOfGamesDeveloped: "Number of games developed",
	numberOfGamesPublished: "Number of games published",
};

const engineGroupModeNames: Record<SettingSchemaLib.EngineGroupMode, string> =
{
	name: "Name",
	numberOfGames: "Number of games",
};

const platformGroupModeNames: Record<SettingSchemaLib.PlatformGroupMode, string> =
{
	name: "Name",
	numberOfGames: "Number of games",
};

const seriesGroupModeNames: Record<SettingSchemaLib.SeriesGroupMode, string> =
{
	name: "Name",
	numberOfGames: "Number of games",
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

export function getCompanyGroupModeName(companyGroupMode: SettingSchemaLib.CompanyGroupMode)
{
	return companyGroupModeNames[companyGroupMode];
}

export function getEngineGroupModeName(engineGroupMode: SettingSchemaLib.EngineGroupMode)
{
	return engineGroupModeNames[engineGroupMode];
}

export function getPlatformGroupModeName(platformGroupMode: SettingSchemaLib.PlatformGroupMode)
{
	return platformGroupModeNames[platformGroupMode];
}

export function getSeriesGroupModeName(seriesGroupMode: SettingSchemaLib.SeriesGroupMode)
{
	return seriesGroupModeNames[seriesGroupMode];
}