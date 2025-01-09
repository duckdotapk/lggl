//
// Imports
//

import { GameGroupManager } from "../../classes/GameGroupManager.js";
import { GameDetailsGame } from "../../components/GameDetails.js";

import { Library } from "../../components/Library.js";
import { SiteOptions } from "../../components/Site.js";

import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: SettingModelLib.Settings;
	gameGroupManager: GameGroupManager;
	selectedGame: GameDetailsGame;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "games",
		pageTitle: options.selectedGame.name + " | Games",
		content: Library(
			{
				settings: options.settings,
				gameGroupManager: options.gameGroupManager,
				selectedGame: options.selectedGame,
			}),
	};
}