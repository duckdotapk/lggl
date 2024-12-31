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

function Header(game: GameDetailsGame)
{
	return new DE("header",
		{
			class: "component-game-details-header",
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

function PlayActionButtonGroup(game: GameDetailsGame)
{
	return new DE("div",
		{
			class: "component-game-details-play-action-button-group",
		},
		[
			game.gamePlayActions.map((gamePlayAction) => Button(gamePlayAction.name,
				{
					"data-game-play-action-id": gamePlayAction.id,
				})),
		]);
}

//
// Component
//

export type GameDetailsGame = Prisma.GameGetPayload<
	{
		include:
		{
			gamePlayActions: true;
		};
	}>;

export function GameDetails(game: GameDetailsGame)
{
	return new DE("div", 
		{
			class: "component-game-details",
			
			"data-game-id": game.id,
		},
		[
			Header(game),

			PlayActionButtonGroup(game),
		]);
}