//
// Imports
//

import { Prisma } from "@prisma/client";

import
{
	CompanyGroupMode,
	CompanyGroupModeSchema,
	EngineGroupMode,
	EngineGroupModeSchema,
	GameGroupMode,
	GameGroupModeSchema,
	InitialProcessCheckDelay,
	InitialProcessCheckDelaySchema,
	MaxProcessCheckAttempts,
	MaxProcessCheckAttemptsSchema,
	PlatformGroupMode,
	PlatformGroupModeSchema,
	ProcessCheckInterval,
	ProcessCheckIntervalSchema,
	SeriesGroupMode,
	SeriesGroupModeSchema,
	ShowFavoritesGroup,
	ShowFavoritesGroupSchema,
	ShowHiddenGames,
	ShowHiddenGamesSchema,
	ShowNsfwGames,
	ShowNsfwGamesSchema,
	ShowRegularGames,
	ShowRegularGamesSchema,	
} from "./Setting.schemas.js";

//
// Class
//

export class Settings
{
	gameGroupMode: GameGroupMode = "lastPlayedDate";
	showFavoritesGroup: ShowFavoritesGroup = true;
	showRegularGames: ShowRegularGames = true;
	showHiddenGames: ShowHiddenGames = false;
	showNsfwGames: ShowNsfwGames = false;

	companyGroupMode: CompanyGroupMode = "name";

	engineGroupMode: EngineGroupMode = "name";

	platformGroupMode: PlatformGroupMode = "name";

	seriesGroupMode: SeriesGroupMode = "name";

	initialProcessCheckDelay: InitialProcessCheckDelay = 2000;
	processCheckInterval: ProcessCheckInterval = 2000;
	maxProcessCheckAttempts: MaxProcessCheckAttempts = 20;

	constructor(settings: Prisma.SettingGetPayload<null>[])
	{
		for (const setting of settings)
		{
			switch (setting.name)
			{
				case "GAME_GROUP_MODE":
				{
					const valueParseResult = GameGroupModeSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.gameGroupMode = valueParseResult.data;
					}

					break;
				}

				case "SHOW_FAVORITES_GROUP":
				{
					const valueParseResult = ShowFavoritesGroupSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.showFavoritesGroup = valueParseResult.data;
					}

					break;
				}

				case "SHOW_REGULAR_GAMES":
				{
					const valueParseResult = ShowRegularGamesSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.showRegularGames = valueParseResult.data;
					}

					break;
				}

				case "SHOW_HIDDEN_GAMES":
				{
					const valueParseResult = ShowHiddenGamesSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.showHiddenGames = valueParseResult.data;
					}

					break;
				}

				case "SHOW_NSFW_GAMES":
				{
					const valueParseResult = ShowNsfwGamesSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.showNsfwGames = valueParseResult.data;
					}

					break;
				}

				case "COMPANY_GROUP_MODE":
				{
					const valueParseResult = CompanyGroupModeSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.companyGroupMode = valueParseResult.data;
					}

					break;
				}

				case "ENGINE_GROUP_MODE":
				{
					const valueParseResult = EngineGroupModeSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.engineGroupMode = valueParseResult.data;
					}

					break;
				}

				case "PLATFORM_GROUP_MODE":
				{
					const valueParseResult = PlatformGroupModeSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.platformGroupMode = valueParseResult.data;
					}

					break;
				}

				case "SERIES_GROUP_MODE":
				{
					const valueParseResult = SeriesGroupModeSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.seriesGroupMode = valueParseResult.data;
					}

					break
				}

				case "INITIAL_PROCESS_CHECK_DELAY":
				{
					const valueParseResult = InitialProcessCheckDelaySchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.initialProcessCheckDelay = valueParseResult.data;
					}

					break;
				}

				case "PROCESS_CHECK_INTERVAL":
				{
					const valueParseResult = ProcessCheckIntervalSchema.safeParse(setting.value);

					if (valueParseResult.success)
					{
						this.processCheckInterval = valueParseResult.data;
					}

					break;
				}

				case "MAX_PROCESS_CHECK_ATTEMPTS":
				{
					const valueParseResult = MaxProcessCheckAttemptsSchema.safeParse(setting.value);

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

const gameGroupModeNames: Record<GameGroupMode, string> =
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
	purchaseDate: "Purchase date",
	series: "Series",
	steamDeckCompatibility: "Steam Deck compatibility",
};

const companyGroupModeNames: Record<CompanyGroupMode, string> =
{
	name: "Name",
	numberOfGamesDeveloped: "Number of games developed",
	numberOfGamesPublished: "Number of games published",
};

const engineGroupModeNames: Record<EngineGroupMode, string> =
{
	name: "Name",
	numberOfGames: "Number of games",
};

const platformGroupModeNames: Record<PlatformGroupMode, string> =
{
	name: "Name",
	numberOfGames: "Number of games",
};

const seriesGroupModeNames: Record<SeriesGroupMode, string> =
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

export function getGameGroupModeName(gameGroupMode: GameGroupMode)
{
	return gameGroupModeNames[gameGroupMode];
}

export function getCompanyGroupModeName(companyGroupMode: CompanyGroupMode)
{
	return companyGroupModeNames[companyGroupMode];
}

export function getEngineGroupModeName(engineGroupMode: EngineGroupMode)
{
	return engineGroupModeNames[engineGroupMode];
}

export function getPlatformGroupModeName(platformGroupMode: PlatformGroupMode)
{
	return platformGroupModeNames[platformGroupMode];
}

export function getSeriesGroupModeName(seriesGroupMode: SeriesGroupMode)
{
	return seriesGroupModeNames[seriesGroupMode];
}