//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { LibraryGameDetails, LibraryGameDetailsGame } from "./LibraryGameDetails.js";
import { LibrarySidebar, LibrarySidebarGame } from "./LibrarySidebar.js";

import { staticMiddleware } from "../instances/server.js";

//
// Component
//

export type LibraryGame = Prisma.GameGetPayload<null>;

export function Library(sidebarGames: LibrarySidebarGame[], selectedGame: LibraryGameDetailsGame | null)
{
	return new DE("html",
		{
			lang: "en",
		},
		[
			new DE("head", null,
				[
					new DE("title", null, "Game Launcher"),

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
							LibrarySidebar(sidebarGames),

							selectedGame != null
								? LibraryGameDetails(selectedGame)
								: null,
						]),
				]),
		]);
}