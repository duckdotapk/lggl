//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { Block } from "../basic/Block.js";

import { Button } from "../input/Button.js";
import { Control } from "../input/Control.js";
import { Label } from "../input/Label.js";

import { ColumnLayout } from "../layout/ColumnLayout.js";

//
// Component
//

export type UpsertPlatformFormPlatform = Prisma.PlatformGetPayload<null> | null;

export function UpsertPlatformForm(platform: UpsertPlatformFormPlatform)
{
	return new DE("form",
		{
			class: "component-upsert-platform-form",
			autocomplete: "off",

			"data-platform-id": platform?.id,
		},
		[
			Block(ColumnLayout(2,
				[
					new DE("div", null,
						[
							Label("name", "Name"),
		
							Control(
								{
									type: "text",
									name: "name",
									required: true,
									placeholder: "Name",
									value: platform?.name,
								}),
						]),

					new DE("div", null,
						[
							Label("iconName", "Font Awesome icon name"),
								
							Control(
								{
									type: "text",
									name: "iconName",
									required: false,
									placeholder: "Icon name",
									value: platform?.iconName,
								}),
						]),
				])),

			ColumnLayout(platform != null ? 2 : 1,
				[
					platform != null
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
							iconName: platform == null ? "fa-solid fa-plus" : "fa-solid fa-save",
							text: platform == null ? "Create" : "Save",
						}),
				]),
		]);
}