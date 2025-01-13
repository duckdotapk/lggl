//
// Imports
//

import { DE } from "@donutteam/document-builder";
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
	engines: Prisma.EngineGetPayload<null>[];
	game: Prisma.GameGetPayload<null>;
	gameEngine: Prisma.GameEngineGetPayload<{ include: { engine: true } }> | null;
}

export function UpsertGameEngineForm(options: UpsertGameEngineFormOptions)
{
	return new DE("form",
		{
			class: "component-upsert-game-engine-form",
			autocomplete: "off",

			"data-game-id": options.game.id,
			"data-game-engine-id": options.gameEngine?.id ?? null,
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
									value: options.gameEngine?.engine_id,
									showEmptyOption: true,
									options: options.engines.map((engine) => ({ value: engine.id, label: engine.name }))
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
									value: options.gameEngine?.version,
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
									value: options.gameEngine?.notes,
								}),
						]),
				]),

			ColumnLayout(options.gameEngine != null ? 2 : 1,
				[
					options.gameEngine != null
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
							iconName: options.gameEngine == null ? "fa-solid fa-plus" : "fa-solid fa-save",
							text: options.gameEngine == null ? "Create" : "Save",
						}),
				]),
		]);
}