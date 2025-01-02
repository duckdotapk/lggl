//
// Imports
//

import { Prisma } from "@prisma/client";

import { Toolbar } from "./Toolbar.js";

import { Checkbox } from "../Checkbox.js";

//
// Components
//

export function GameFlagsToolbar(game: Prisma.GameGetPayload<null>)
{
	return Toolbar("component-game-flags-toolbar",
		{
			"data-game-id": game.id.toString(),
		},
		[
			Checkbox("isEarlyAccess", "Is Early Access", game.isEarlyAccess),
			Checkbox("isFavorite", "Is Favorite", game.isFavorite),
			Checkbox("isHidden", "Is Hidden", game.isHidden),
			Checkbox("isNsfw", "Is NSFW", game.isNsfw),
			Checkbox("isShelved", "Is Shelved", game.isShelved),
		]);
}