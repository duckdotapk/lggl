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

export function ChooseGamePlayActionDialog
(
	gamePlayActions: Prisma.GamePlayActionGetPayload<
	{
		select:
		{
			id: true;
			name: true;
		};
	}>[],
)
{
	return Dialog("component-choose-game-play-action-dialog", null,
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