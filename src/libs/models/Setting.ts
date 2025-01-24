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

	initialProcessCheckDelay: SettingSchemaLib.InitialProcessCheckDelay = 2000;
	processCheckInterval: SettingSchemaLib.ProcessCheckInterval = 2000;
	maxProcessCheckAttempts: SettingSchemaLib.MaxProcessCheckAttempts = 20;

	constructor(settings: Prisma.SettingGetPayload<null>[])
	{
		for (const setting of settings)
		{
			switch (setting.name)
			{
				case "GAME_GROUP_MODE":
				{
					const valueParseResult = SettingSchemaLib.GameGroupModeSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.gameGroupMode = valueParseResult.data;
					}

					break;
				}

				case "SHOW_FAVORITES_GROUP":
				{
					const valueParseResult = SettingSchemaLib.ShowFavoritesGroupSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.showFavoritesGroup = valueParseResult.data;
					}

					break;
				}

				case "SHOW_REGULAR_GAMES":
				{
					const valueParseResult = SettingSchemaLib.ShowRegularGamesSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.showRegularGames = valueParseResult.data;
					}

					break;
				}

				case "SHOW_HIDDEN_GAMES":
				{
					const valueParseResult = SettingSchemaLib.ShowHiddenGamesSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.showHiddenGames = valueParseResult.data;
					}

					break;
				}

				case "SHOW_NSFW_GAMES":
				{
					const valueParseResult = SettingSchemaLib.ShowNsfwGamesSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.showNsfwGames = valueParseResult.data;
					}

					break;
				}

				case "COMPANY_GROUP_MODE":
				{
					const valueParseResult = SettingSchemaLib.CompanyGroupModeSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.companyGroupMode = valueParseResult.data;
					}

					break;
				}

				case "ENGINE_GROUP_MODE":
				{
					const valueParseResult = SettingSchemaLib.EngineGroupModeSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.engineGroupMode = valueParseResult.data;
					}

					break;
				}

				case "PLATFORM_GROUP_MODE":
				{
					const valueParseResult = SettingSchemaLib.PlatformGroupModeSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.platformGroupMode = valueParseResult.data;
					}

					break;
				}

				case "SERIES_GROUP_MODE":
				{
					const valueParseResult = SettingSchemaLib.SeriesGroupModeSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.seriesGroupMode = valueParseResult.data;
					}

					break
				}

				case "INITIAL_PROCESS_CHECK_DELAY":
				{
					const valueParseResult = SettingSchemaLib.InitialProcessCheckDelaySchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.initialProcessCheckDelay = valueParseResult.data;
					}

					break;
				}

				case "PROCESS_CHECK_INTERVAL":
				{
					const valueParseResult = SettingSchemaLib.ProcessCheckIntervalSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.processCheckInterval = valueParseResult.data;
					}

					break;
				}

				case "MAX_PROCESS_CHECK_ATTEMPTS":
				{
					const valueParseResult = SettingSchemaLib.MaxProcessCheckAttemptsSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.maxProcessCheckAttempts = valueParseResult.data;
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
	completionStatus: "Completion status",
	createdDate: "Created date",
	developer: "Developer",
	engine: "Engine",
	firstCompletedDate: "First completed date",
	firstPlayedDate: "First played date",
	lastPlayedDate: "Last played date",
	name: "Name",
	playTime: "Play time",
	publisher: "Publisher",
	series: "Series",
	steamDeckCompatibility: "Steam Deck compatibility",
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