//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { LibrarySidebarGroup } from "./LibrarySidebarGroup.js";

//
// Component
//

export type LibrarySidebarGames = Prisma.GameGetPayload<null>[];

export type LibrarySidebarSelectedGame = Prisma.GameGetPayload<null> | null;

export function LibrarySidebar(gameGroups: Map<string, LibrarySidebarGames>, selectedGame: LibrarySidebarSelectedGame, searchParameters: URLSearchParams)
{
	return new DE("aside", "component-library-sidebar",
		[
			Array.from(gameGroups.entries()).map(([ title, games ]) => LibrarySidebarGroup(title, games, selectedGame, searchParameters)),
		]);
}