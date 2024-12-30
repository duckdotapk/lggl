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

export type LibrarySidebarItemSelectedGame = Prisma.GameGetPayload<null> | null;

export function LibrarySidebarItem(game: LibrarySidebarItemGame, selectedGame: LibrarySidebarItemSelectedGame, searchParameters: URLSearchParams)
{
	let className = "component-library-sidebar-item";

	if (selectedGame != null && selectedGame.id == game.id)
	{
		className += " selected";
	}

	const itemSearchParameters = new URLSearchParams(searchParameters);

	itemSearchParameters.set("selectedGameId", game.id.toString());

	return new DE("a",
		{
			class:className,

			href: "/?" + itemSearchParameters.toString(),
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