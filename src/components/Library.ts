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
	settings: SettingModelLib.Settings;
	gameGroupManager: GameGroupManager;
	selectedGame: GameDetailsGame | null;
};

export function Library(options: LibraryOptions)
{
	return new DE("div", "component-library",
		[
			FilterSettingsToolbar(options.settings),

			GameList(options.gameGroupManager, options.selectedGame),

			options.selectedGame != null ? GameDetails(options.selectedGame) : null,
		]);
}