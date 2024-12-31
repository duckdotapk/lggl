//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { GameDetails } from "./GameDetails.js";
import { Sidebar } from "./Sidebar.js";

import { staticMiddleware } from "../instances/server.js";

//
// Component
//

export type LibraryGames = Prisma.GameGetPayload<null>[];

export type LibrarySelectedGame = Prisma.GameGetPayload<
	{
		include:
		{
			gamePlayActions: true;
		};
	}> | null;

export function Library(gameGroups: Map<string, LibraryGames>, selectedGame: LibrarySelectedGame, searchParameters: URLSearchParams)
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
							Sidebar(gameGroups, selectedGame, searchParameters),

							selectedGame != null
								? GameDetails(selectedGame)
								: null,
						]),
				]),
		]);
}