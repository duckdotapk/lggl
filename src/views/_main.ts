//
// Imports
//

import { GameGroupManager } from "../classes/GameGroupManager.js";

import { GameDetailsGame } from "../components/GameDetails.js";
import { Library } from "../components/Library.js";
import { SiteOptions } from "../components/Site.js";

import * as LibrarySchemaLib from "../libs/schemas/Library.js";

//
// View
//

export type ViewOptions =
{
	searchParameters: URLSearchParams;
	filterOptions: LibrarySchemaLib.FilterOptions;
	gameGroupManager: GameGroupManager;
	selectedGame: GameDetailsGame | null;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "library",
		content: Library(
			{
				searchParameters: options.searchParameters,
				filterOptions: options.filterOptions,
				gameGroupManager: options.gameGroupManager,
				game: options.selectedGame,
			}),
	};
}