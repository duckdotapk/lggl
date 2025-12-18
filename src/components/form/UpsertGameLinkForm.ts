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

export function UpsertGameLinkForm
(
	game: Prisma.GameGetPayload<null>,
	gameLink: Prisma.GameLinkGetPayload<null> | null,
)
{
	return new DE("form",
		{
			class: "component-upsert-game-link-form",
			autocomplete: "off",

			"data-game-id": game.id,
			"data-game-link-id": gameLink?.id ?? null,
		},
		[
			ColumnLayout(2,
			[
				new DE("div", null,
				[
					Label("title", "Title"),
		
					Control(
					{
						type: "text",
						name: "title",
						required: true,
						value: gameLink?.title,
						placeholder: "Title",
					}),
				]),

				new DE("div", null,
				[
					Label("url", "URL"),
		
					Control(
					{
						type: "url",
						name: "url",
						required: true,
						value: gameLink?.url,
						placeholder: "URL",
					}),
				]),
			]),

			ColumnLayout(gameLink != null ? 2 : 1,
			[
				gameLink != null
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
					iconName: gameLink == null
						? "fa-solid fa-plus"
						: "fa-solid fa-save",
					text: gameLink == null
						? "Create"
						: "Save",
				}),
			]),
		],
	);
}