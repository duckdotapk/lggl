//
// Imports
//

import { DE } from "@lorenstuff/document-builder";
import { $Enums, Prisma } from "@prisma/client";

import { Button } from "../input/Button.js";
import { Checkbox } from "../input/Checkbox.js";
import { Control } from "../input/Control.js";
import { Label } from "../input/Label.js";

import { ColumnLayout } from "../layout/ColumnLayout.js";

import { typeNames } from "../../libs/models/GamePlayAction.js";

//
// Component
//

export function UpsertGamePlayActionForm
(
	game: Prisma.GameGetPayload<null>,
	gamePlayAction: Prisma.GamePlayActionGetPayload<null> | null,
)
{
	return new DE("form",
		{
			class: "component-upsert-game-play-action-form",
			autocomplete: "off",

			"data-game-id": game.id,
			"data-game-play-action-id": gamePlayAction?.id ?? null,
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
						value: gamePlayAction?.name,
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
						value: gamePlayAction?.type,
						showEmptyOption: true,
						options: Object.values($Enums.GamePlayActionType).map((option) =>
						({
							value: option,
							label: typeNames[option],
						})),
					}),
				]),
			]),
				
			ColumnLayout(2,
			[
				new DE("div", null,
				[
					Label("path", "Path"),
					Control(
					{
						type: "text",
						name: "path",
						required: true,
						value: gamePlayAction?.path,
						placeholder: "Path",
					}),
				]),

				new DE("div", null,
				[
					Label("workingDirectory", "Working directory"),
					Control(
					{
						type: "text",
						name: "workingDirectory",
						required: false,
						value: gamePlayAction?.workingDirectory,
						placeholder: "Working directory",
					}),
				]),
			]),

			// TODO: an actual frontend for editing these, not just a text box
			Label("additionalArguments", "Additional arguments"),
			Control(
			{
				type: "textarea",
				name: "additionalArguments",
				required: false,
				value: gamePlayAction?.additionalArguments ?? null,
				placeholder: "Additional arguments",
			}),

			// TODO: an actual frontend for editing these, not just a text box
			Label("processRequirements", "Process requirements"),
			Control(
			{
				type: "textarea",
				name: "processRequirements",
				required: false,
				value: gamePlayAction?.processRequirements ?? null,
				placeholder: "Process requirements",
			}),

			Checkbox("isArchived", "Is archived", gamePlayAction?.isArchived ?? false),

			ColumnLayout(gamePlayAction != null ? 2 : 1,
			[
				gamePlayAction != null
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
					iconName: gamePlayAction == null
						? "fa-solid fa-plus"
						: "fa-solid fa-save",
					text: gamePlayAction == null
						? "Create"
						: "Save",
				}),
			]),
		],
	);
}