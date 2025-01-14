//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { Header } from "../basic/Header.js";

import { Dialog } from "./Dialog.js";

import { Button } from "../input/Button.js";
import { Control } from "../input/Control.js";

//
// Component
//

export type GameNotesDialogGame = Prisma.GameGetPayload<
	{
		select:
		{
			id: true;
			notes: true;
		};
	}>;

export function GameNotesDialog(game: GameNotesDialogGame)
{
	return Dialog("component-game-notes-dialog",
		{
			"data-game-id": game.id,
		},
		[
			Header(2, "Notes"),

			new DE("form", null,
				[
					Control(
						{
							type: "textarea",
							name: "notes",
							placeholder: "Notes",
							required: false,
							value: game.notes,
						}),
		
					Button(
						{
							style: "success",
							type: "submit",
							iconName: "fa-solid fa-save",
							text: "Save",
						}),
				]),
		]);
}