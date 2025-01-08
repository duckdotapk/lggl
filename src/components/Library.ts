//
// Imports
//

import { DE } from "@donutteam/document-builder";

import { GameGroupManager } from "../classes/GameGroupManager.js";

import { FilterSettingsToolbar } from "./toolbar/FilterSettingsToolbar.js";

import { GameDetails, GameDetailsGame } from "./GameDetails.js";
import { GameList } from "./GameList.js";

import * as SettingModelLib from "../libs/models/Setting.js";

//
// Component
//

export type LibraryOptions =
{
	searchParameters: URLSearchParams;
	settings: SettingModelLib.Settings;
	gameGroupManager: GameGroupManager;
	game: GameDetailsGame | null;
};

export function Library(options: LibraryOptions)
{
	return new DE("div", "component-library",
		[
			FilterSettingsToolbar(options.settings),

			GameList(options.gameGroupManager, options.game, options.searchParameters),

			options.game != null
				? GameDetails(options.game)
				: null,
		]);
}