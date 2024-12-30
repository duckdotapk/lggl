//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { Button } from "./Button.js";

//
// Component
//

export type GamePlayActionButtonGroupGame = Prisma.GameGetPayload<
	{
		include:
		{
			gamePlayActions: true;
		};
	}>;

export function GamePlayActionButtonGroup(game: GamePlayActionButtonGroupGame)
{
	return new DE("div",
		{
			class: "component-game-play-action-button-group",
		},
		[
			game.gamePlayActions.map((gamePlayAction) => Button(gamePlayAction.name,
				{
					"data-game-id": game.id,
					"data-game-play-action-id": gamePlayAction.id,
				})),
		]);
}