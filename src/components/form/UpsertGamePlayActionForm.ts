//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { Button } from "../input/Button.js";
import { Checkbox } from "../input/Checkbox.js";
import { Control } from "../input/Control.js";
import { Label } from "../input/Label.js";

import { ColumnLayout } from "../layout/ColumnLayout.js";

import * as GamePlayActionModelLib from "../../libs/models/GamePlayAction.js";

import * as GamePlayActionSchemaLib from "../../libs/schemas/GamePlayAction.js";

//
// Component
//

export type UpsertGamePlayActionFormOptions =
{
	game: Prisma.GameGetPayload<null>;
	gamePlayAction: Prisma.GamePlayActionGetPayload<null> | null;
};

export function UpsertGamePlayActionForm(options: UpsertGamePlayActionFormOptions)
{
	return new DE("form",
		{
			class: "component-upsert-game-play-action-form",
			autocomplete: "off",

			"data-game-id": options.game.id,
			"data-game-play-action-id": options.gamePlayAction?.id ?? null,
		},
		[
			ColumnLayout(2,
				[
					new DE("div", null,
						[
							Label("name", "Name"),

							Control(
								{
									type: "text",
									name: "name",
									required: true,
									value: options.gamePlayAction?.name,
									placeholder: "Name",
								}),
						]),

					new DE("div", null,
						[
							Label("type", "Type"),

							Control(
								{
									type: "select",
									name: "type",
									required: true,
									value: options.gamePlayAction?.type,
									options: GamePlayActionSchemaLib.TypeSchema.options.map((option) => ({ value: option, label: GamePlayActionModelLib.getTypeName(option) }))
								}),
						]),
				]),

			Label("path", "Path"),

			Control(
				{
					type: "text",
					name: "path",
					required: true,
					value: options.gamePlayAction?.path,
					placeholder: "Path",
				}),

			Label("trackingPath", "Tracking path"),

			Control(
				{
					type: "text",
					name: "trackingPath",
					required: true,
					value: options.gamePlayAction?.trackingPath,
					placeholder: "Tracking path",
				}),

			Label("argumentsJson", "Arguments (as JSON string array)"),

			Control(
				{
					type: "textarea",
					name: "argumentsJson",
					required: true,
					value: options.gamePlayAction?.argumentsJson ?? "[]",
					placeholder: "Arguments (as JSON string array)",
				}),

			Checkbox("isArchived", "Is archived", options.gamePlayAction?.isArchived ?? false),

			ColumnLayout(options.gamePlayAction != null ? 2 : 1,
				[
					options.gamePlayAction != null
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
							iconName: options.gamePlayAction == null ? "fa-solid fa-plus" : "fa-solid fa-save",
							text: options.gamePlayAction == null ? "Create" : "Save",
						}),
				]),
		]);
}