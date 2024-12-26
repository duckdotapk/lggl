//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { Button } from "./Button.js";

import { staticMiddleware } from "../instances/server.js";

//
// Locals
//

function Header(game: LibraryGameDetailsGame)
{
	return new DE("header", "component-library-game-details-header", game.name);
}

//
// Component
//

export type LibraryGameDetailsGame = Prisma.GameGetPayload<null>;

export function LibraryGameDetails(game: LibraryGameDetailsGame)
{
	let style = "";

	if (game.backgroundPath != null)
	{
		style += "background-image: url(\"" + staticMiddleware.getCacheBustedPath(game.backgroundPath) + "\");";
	}

	return new DE("div",
		{
			class: "component-library-game-details",

			style,
		},
		[
			Header(game),

			game.isInstalled
				? Button("Launch")
				: null,
		]);
}