//
// Imports
//

import { DE } from "@donutteam/document-builder";

import { GameGroupManager } from "../classes/GameGroupManager.js";

import { FilterOptionsToolbar } from "./toolbar/FilterOptionsToolbar.js";

import { GameDetails, GameDetailsGame } from "./GameDetails.js";
import { Sidebar } from "./Sidebar.js";

import { staticMiddleware } from "../instances/server.js";

import * as LibrarySchemaLib from "../libs/schemas/Library.js";

//
// Component
//

export type LibraryOptions =
{
	searchParameters: URLSearchParams;
	filterOptions: LibrarySchemaLib.FilterOptions;
	gameGroupManager: GameGroupManager;
	selectedGame: GameDetailsGame | null;
};

export function Library(options: LibraryOptions)
{
	return new DE("html",
		{
			lang: "en",
		},
		[
			new DE("head", null,
				[
					new DE("title", null, "LGGL"),

					new DE("link",
						{
							rel: "icon",
							href: "/favicon.ico",
							type: "image/x-icon",
						}),

					new DE("link",
						{
							rel: "stylesheet",
							href: staticMiddleware.getCacheBustedPath("/data/fontawesome/css/all.min.css"),
						}),

					new DE("link",
						{
							rel: "stylesheet",
							href: staticMiddleware.getCacheBustedPath("/data/generated/client.css"),
						}),

					new DE("script",
						{
							type: "module",
							src: staticMiddleware.getCacheBustedPath("/data/generated/client.js"),
						}),
				]),

			new DE("body", null,
				[
					new DE("div", "component-library",
						[
							FilterOptionsToolbar(options.filterOptions),

							Sidebar(options.gameGroupManager, options.selectedGame, options.searchParameters),

							options.selectedGame != null
								? GameDetails(options.selectedGame)
								: null,
						]),
				]),
		]);
}