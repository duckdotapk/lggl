//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { FilterOptionsToolbar } from "./FilterOptionsToolbar.js";
import { GameDetails } from "./GameDetails.js";
import { Sidebar } from "./Sidebar.js";

import { staticMiddleware } from "../instances/server.js";

import * as LibraryLib from "../../_shared/libs/Library.js";

//
// Component
//

export type LibraryOptions =
{
	searchParameters: URLSearchParams;
	filterOptions: LibraryLib.FilterOptions;
	gameGroups: Map<string, Prisma.GameGetPayload<null>[]>;
	selectedGame: Prisma.GameGetPayload<
		{
			include:
			{
				gamePlayActions: true;
			};
		}> | null;
	recentGamePlayActionSessions: Prisma.GamePlayActionSessionGetPayload<
		{
			include:
			{
				platform: true;
			};
		}>[];
}

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
							rel: "stylesheet",
							href: staticMiddleware.getCacheBustedPath("/data/fontawesome/css/all.min.css"),
						}),

					new DE("link",
						{
							rel: "stylesheet",
							href: staticMiddleware.getCacheBustedPath("/data/client.css"),
						}),

					new DE("script",
						{
							type: "module",
							src: staticMiddleware.getCacheBustedPath("/data/client.js"),
						}),
				]),

			new DE("body", null,
				[
					new DE("div", "component-library",
						[
							FilterOptionsToolbar(options.filterOptions),

							Sidebar(options.gameGroups, options.selectedGame, options.searchParameters),

							options.selectedGame != null
								? GameDetails(options.selectedGame, options.recentGamePlayActionSessions)
								: null,
						]),
				]),
		]);
}