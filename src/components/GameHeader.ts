//
// Imports
//

import { DE } from "@lorenstuff/document-builder";
import { Prisma } from "@prisma/client";

import { staticMiddleware } from "../instances/server.js";

import { getGameImageUrls } from "../libs/models/Game.js";

//
// Locals
//

export function GameHeader(game: Prisma.GameGetPayload<null>)
{
	const imageUrls = getGameImageUrls(game);

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