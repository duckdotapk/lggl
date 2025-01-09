//
// Imports
//

import { GameGroupManager } from "../../classes/GameGroupManager.js";

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
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "games",
		pageTitle: "Games",
		content: Library(
			{
				settings: options.settings,
				gameGroupManager: options.gameGroupManager,
				selectedGame: null,
			}),
	};
}