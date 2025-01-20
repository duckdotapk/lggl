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

export type UpsertGamePlatformFormOptions =
{
	platforms: Prisma.PlatformGetPayload<null>[];
	game: Prisma.GameGetPayload<null>;
	gamePlatform: Prisma.GamePlatformGetPayload<null> | null;
};

export function UpsertGamePlatformForm(options: UpsertGamePlatformFormOptions)
{
	return new DE("form",
		{
			class: "component-upsert-game-platform-form",
			autocomplete: "off",

			"data-game-id": options.game.id,
			"data-game-platform-id": options.gamePlatform?.id ?? null,
		},
		[
			ColumnLayout(2,
				[
					new DE("div", null,
						[
							Label("platform_id", "Platform"),

							Control(
								{
									type: "select",
									name: "platform_id",
									required: true,
									value: options.gamePlatform?.platform_id,
									showEmptyOption: true,
									options: options.platforms.map((platform) => ({ value: platform.id, label: platform.name }))
								}),
						]),

					new DE("div", null,
						[
							Label("notes", "Notes"),

							Control(
								{
									type: "text",
									name: "notes",
									required: false,
									value: options.gamePlatform?.notes,
									placeholder: "Notes",
								}),
						]),
				]),

			ColumnLayout(options.gamePlatform != null ? 2 : 1,
				[
					options.gamePlatform != null
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
							iconName: options.gamePlatform == null ? "fa-solid fa-plus" : "fa-solid fa-save",
							text: options.gamePlatform == null ? "Create" : "Save",
						}),
				]),
		]);
}