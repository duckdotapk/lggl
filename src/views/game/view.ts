//
// Imports
//

import { GameSettingsToolbar } from "../../components/toolbar/GameSettingsToolbar.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { GameActionToolbar } from "../../components/toolbar/GameActionToolbar.js";

import { GameDetails, GameDetailsGame } from "../../components/GameDetails.js";
import { GameHeader } from "../../components/GameHeader.js";
import { SiteOptions } from "../../components/Site.js";

import * as GameModelLib from "../../libs/models/Game.js";
import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: Awaited<ReturnType<typeof GameModelLib.findGroups>>;
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
				content:
				[
					GameHeader(options.game),
					GameActionToolbar(options.game),
					GameDetails(options.game),
				],
			}),
	};
}