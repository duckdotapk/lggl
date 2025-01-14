//
// Imports
//

import { Prisma } from "@prisma/client";

import { Header } from "../basic/Header.js";

import { Dialog } from "./Dialog.js";

import { Button } from "../input/Button.js";

//
// Component
//

export type ChooseGamePlayActionDialogGamePlayActions = Prisma.GamePlayActionGetPayload<
	{
		select:
		{
			id: true;
			name: true;
		};
	}>[];

export function ChooseGamePlayActionDialog(game_id: number, gamePlayActions: ChooseGamePlayActionDialogGamePlayActions)
{
	return Dialog("component-choose-game-play-action-dialog",
		{
			"data-game-id": game_id,
		},
		[
			Header(2, "Choose play action"),

			gamePlayActions.map((gamePlayAction) => Button(
				{
					style: "success",
					type: "button",
					extraAttributes:
					{
						"data-game-play-action-id": gamePlayAction.id,
					},
					iconName: "fa-solid fa-play",
					text: gamePlayAction.name,
				})),
		]);
}