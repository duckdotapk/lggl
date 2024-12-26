//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { LibrarySidebarItem } from "./LibrarySidebarItem.js";

//
// Component
//

export type LibrarySidebarGame = Prisma.GameGetPayload<null>;

export function LibrarySidebar(games: LibrarySidebarGame[])
{
	return new DE("aside", "component-library-sidebar",
		[
			games.map((game) => LibrarySidebarItem(game)),
		]);
}