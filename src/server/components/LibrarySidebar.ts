//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { LibrarySidebarItem } from "./LibrarySidebarItem.js";

//
// Component
//

export type LibrarySidebarGames = Prisma.GameGetPayload<null>[];

export type LibrarySidebarSelectedGame = Prisma.GameGetPayload<null> | null;

export function LibrarySidebar(games: LibrarySidebarGames, selectedGame: LibrarySidebarSelectedGame, searchParameters: URLSearchParams)
{
	return new DE("aside", "component-library-sidebar",
		[
			games.map((game) => LibrarySidebarItem(game, selectedGame, searchParameters)),
		]);
}