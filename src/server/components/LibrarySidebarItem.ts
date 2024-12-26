//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { staticMiddleware } from "../instances/server.js";

//
// Locals
//

export type LibrarySidebarItemGame = Prisma.GameGetPayload<null>;

export function LibrarySidebarItem(game: LibrarySidebarItemGame)
{
	return new DE("div",
		{
			class: "component-library-sidebar-item",

			"data-game-id": game.id,
		},
		[
			game.iconPath != null
				? new DE("img",
					{
						class: "icon",
						src: staticMiddleware.getCacheBustedPath(game.iconPath),
						alt: game.name + " icon",
					})
				: new DE("span", "icon fa-solid fa-gamepad-modern"),

			new DE("span", "name", game.name),
		]);
}