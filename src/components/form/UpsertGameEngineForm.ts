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

export type UpsertGameEngineFormOptions =
{
}

export function UpsertGameEngineForm
(
	engines: Prisma.EngineGetPayload<null>[],
	game: Prisma.GameGetPayload<null>,
	gameEngine: Prisma.GameEngineGetPayload<{ include: { engine: true } }> | null,
)
{
	return new DE("form",
		{
			class: "component-upsert-game-engine-form",
			autocomplete: "off",

			"data-game-id": game.id,
			"data-game-engine-id": gameEngine?.id ?? null,
		},
		[
			ColumnLayout(3,
			[
				new DE("div", null,
				[
					Label("engine_id", "Engine"),
					Control(
					{
						type: "select",
						name: "engine_id",
						required: true,
						value: gameEngine?.engine_id,
						showEmptyOption: true,
						options: engines.map((engine) =>
						({
							value: engine.id,
							label: engine.name,
						}))
					}),
				]),

				new DE("div", null,
				[
					Label("version", "Version (optional)"),
					Control(
					{
						type: "text",
						name: "version",
						required: false,
						placeholder: "Version",
						value: gameEngine?.version,
					}),
				]),

				new DE("div", null,
				[
					Label("notes", "Notes (optional)"),
					Control(
					{
						type: "text",
						name: "notes",
						required: false,
						placeholder: "Notes",
						value: gameEngine?.notes,
					}),
				]),
			]),

			ColumnLayout(gameEngine != null ? 2 : 1,
			[
				gameEngine != null
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
					iconName: gameEngine == null
						? "fa-solid fa-plus"
						: "fa-solid fa-save",
					text: gameEngine == null
						? "Create"
						: "Save",
				}),
			]),
		]);
}