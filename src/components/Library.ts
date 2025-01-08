//
// Imports
//

import { DE } from "@donutteam/document-builder";

import { GameGroupManager } from "../classes/GameGroupManager.js";

import { FilterOptionsToolbar } from "./toolbar/FilterOptionsToolbar.js";

import { GameDetails, GameDetailsGame } from "./GameDetails.js";
import { GameList } from "./GameList.js";

import * as LibrarySchemaLib from "../libs/schemas/Library.js";

//
// Component
//

export type LibraryOptions =
{
	searchParameters: URLSearchParams;
	filterOptions: LibrarySchemaLib.FilterOptions;
	gameGroupManager: GameGroupManager;
	game: GameDetailsGame | null;
};

export function Library(options: LibraryOptions)
{
	return new DE("div", "component-library",
		[
			FilterOptionsToolbar(options.filterOptions),

			GameList(options.gameGroupManager, options.game, options.searchParameters),

			options.game != null
				? GameDetails(options.game)
				: null,
		]);
}