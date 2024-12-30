//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { staticMiddleware } from "../instances/server.js";

//
// Components
//

export type GameHeaderGame = Prisma.GameGetPayload<null>;

export function GameHeader(game: GameHeaderGame)
{
	return new DE("header",
		{
			class: "component-game-header",
		},
		[
			game.bannerImagePath != null
				? new DE("img",
					{
						class: "image",
			
						src: staticMiddleware.getCacheBustedPath(game.bannerImagePath),
						alt: game.name + " banner",
					})
				: null,

			game.logoImagePath != null
				? new DE("img",
					{
						class: "logo",

						src: staticMiddleware.getCacheBustedPath(game.logoImagePath),
						alt: game.name + " logo",
					})
				: new DE("div", "name", game.name),
		]);
}