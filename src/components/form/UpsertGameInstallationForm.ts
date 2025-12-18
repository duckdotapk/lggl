//
// Imports
//

import { DE } from "@lorenstuff/document-builder";
import { Prisma } from "@prisma/client";

import { Button } from "../input/Button.js";
import { Control } from "../input/Control.js";
import { Label } from "../input/Label.js";

import { ColumnLayout } from "../layout/ColumnLayout.js";

//
// Component
//

export type UpsertGameInstallationFormOptions =
{
};

export function UpsertGameInstallationForm
(
	game: Prisma.GameGetPayload<null>,
	gameInstallation: Prisma.GameInstallationGetPayload<null> | null,
)
{
	return new DE("form",
		{
			class: "component-upsert-game-installation-form",
			autocomplete: "off",

			"data-game-id": game.id,
			"data-game-installation-id": gameInstallation?.id ?? null,
		},
		[
			Label("path", "Path"),
			Control(
			{
				type: "text",
				name: "path",
				required: true,
				value: gameInstallation?.path,
				placeholder: "Path",
			}),

			ColumnLayout(gameInstallation != null ? 2 : 1,
			[
				gameInstallation != null
					? Button(
					{
						style: "danger",
						extraAttributes:
						{
							"data-action": "delete",
						},
						type: "button",
						iconName: "fa-solid fa-trash",
						text: "Delete",
					})
					: null,
			
				Button(
				{
					style: "success",
					type: "submit",
					extraAttributes:
					{
						"data-action": "save",
					},
					iconName: gameInstallation == null
						? "fa-solid fa-plus"
						: "fa-solid fa-save",
					text: gameInstallation == null
						? "Create"
						: "Save",
				}),
			]),
		],
	);
}