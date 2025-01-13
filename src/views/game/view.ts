//
// Imports
//

import { Prisma } from "@prisma/client";

import { GroupManager } from "../../classes/GroupManager.js";

import { GameSettingsToolbar } from "../../components/toolbar/GameSettingsToolbar.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { GameDetails, GameDetailsGame } from "../../components/GameDetails.js";
import { SiteOptions } from "../../components/Site.js";

import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: GroupManager<Prisma.GameGetPayload<{ include: { seriesGames: { include: { series: true } } } }>>;
	game: GameDetailsGame;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "games",
		pageTitle: options.game.name + " | Games",
		content: ListLayout(
			{
				toolbar: GameSettingsToolbar(options.settings),
				groupManager: options.groupManager,
				createHref: "/games/create",
				content: GameDetails(options.game),
			}),
	};
}