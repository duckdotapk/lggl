//
// Imports
//

import { GameGroupManager } from "../classes/GameGroupManager.js";

import { GameDetailsGame } from "../components/GameDetails.js";
import { Library } from "../components/Library.js";
import { SiteOptions } from "../components/Site.js";

import * as SettingModelLib from "../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: SettingModelLib.Settings;
	searchParameters: URLSearchParams;
	gameGroupManager: GameGroupManager;
	selectedGame: GameDetailsGame | null;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "library",
		content: Library(
			{
				settings: options.settings,
				searchParameters: options.searchParameters,
				gameGroupManager: options.gameGroupManager,
				game: options.selectedGame,
			}),
	};
}