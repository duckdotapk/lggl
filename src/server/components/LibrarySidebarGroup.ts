//
// Imports
//

import { DE } from "@donutteam/document-builder";
import * as Utilities from "@donutteam/utilities";
import { Prisma } from "@prisma/client";

import { LibrarySidebarGroupItem } from "./LibrarySidebarGroupItem.js";

//
// Locals
//

export type LibrarySidebarGroupGames = Prisma.GameGetPayload<null>[];

export type LibrarySidebarGroupSelectedGame = Prisma.GameGetPayload<null> | null;

export function LibrarySidebarGroup(title: string, games: LibrarySidebarGroupGames, selectedGame: LibrarySidebarGroupSelectedGame, searchParameters: URLSearchParams)
{
	return new DE("details",
		{
			class: "component-library-sidebar-group",

			open: true,
		},
		[
			new DE("summary", "title",
				[
					title,
					" (",
					Utilities.NumberLib.format(games.length),
					")",
				]),

			games.map((game) => LibrarySidebarGroupItem(game, selectedGame, searchParameters)),
		]);
}