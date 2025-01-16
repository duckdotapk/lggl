//
// Imports
//

import { DE } from "@donutteam/document-builder";

import { staticMiddleware } from "../instances/server.js";

import * as GameModelLib from "../libs/models/Game.js";
import { Prisma } from "@prisma/client";

//
// Locals
//

export type GameHeaderGame = Prisma.GameGetPayload<null>;

export function GameHeader(game: GameHeaderGame)
{
	const imageUrls = GameModelLib.getImageUrls(game);

	let logoImageStyleComponents =
	[
		"--game-header-logo-alignment: " + (game.logoImageAlignment ?? "end"),
		"--game-header-logo-justification: " + (game.logoImageJustification ?? "start"),
	];

	return new DE("header", "component-game-header",
		[
			game.hasBannerImage
				? new DE("img",
					{
						class: "image",
			
						src: staticMiddleware.getCacheBustedPath(imageUrls.banner),
						alt: game.name + " banner",
					})
				: null,

			game.hasLogoImage
				? new DE("img",
					{
						class: "logo",
						style: logoImageStyleComponents.join("; "),

						src: staticMiddleware.getCacheBustedPath(imageUrls.logo),
						alt: game.name + " logo",
					})
				: new DE("div", "name", game.name),
		]);
}