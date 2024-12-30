//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { staticMiddleware } from "../instances/server.js";
import { DateTime } from "luxon";

//
// Locals
//

export type LibrarySidebarGroupItemGame = Prisma.GameGetPayload<null>;

export type LibrarySidebarGroupItemSelectedGame = Prisma.GameGetPayload<null> | null;

export function LibrarySidebarGroupItem(game: LibrarySidebarGroupItemGame, selectedGame: LibrarySidebarGroupItemSelectedGame, searchParameters: URLSearchParams)
{
	let className = "component-library-sidebar-group-item";

	if (selectedGame != null && selectedGame.id == game.id)
	{
		className += " selected";
	}

	const itemSearchParameters = new URLSearchParams(searchParameters);

	itemSearchParameters.set("selectedGameId", game.id.toString());

	return new DE("a",
		{
			class: className,

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

			new DE("div", "text",
				[
					new DE("div", "name", game.name),

					new DE("div", "last-played",
						[
							"Last played ",
							game.lastPlayedDate != null
								? DateTime.fromJSDate(game.lastPlayedDate).toRelative()
								: "never",
						]),
				]),
		]);
}