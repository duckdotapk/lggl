//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { Button } from "./Button.js";

//
// Component
//

export type LibraryGameDetailsGame = Prisma.GameGetPayload<null>;

export function LibraryGameDetails(game: LibraryGameDetailsGame)
{
	return new DE("div",
		{
			class: "component-library-game-details",
		},
		[
			Button("Launch",
				{
					"data-launch-game-id": game.id,
				}),
		]);
}