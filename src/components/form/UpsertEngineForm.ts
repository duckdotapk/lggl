//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { Block } from "../basic/Block.js";

import { Button } from "../input/Button.js";
import { Control } from "../input/Control.js";
import { Label } from "../input/Label.js";

import { Columns } from "../layout/Columns.js";

//
// Component
//

export type UpsertEngineFormEngine = Prisma.EngineGetPayload<null> | null;

export function UpsertEngineForm(engine: UpsertEngineFormEngine)
{
	return new DE("form",
		{
			class: "component-upsert-engine-form",
			autocomplete: "off",

			"data-engine-id": engine?.id,
		},
		[
			Block(Columns(2,
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
									value: engine?.name,
								}),
						]),

					new DE("div", null,
						[
							Label("shortName", "Short name (optional)"),
								
							Control(
								{
									type: "text",
									name: "shortName",
									required: true,
									placeholder: "Short name",
									value: engine?.shortName,
								}),
						]),
				])),

			Columns(engine != null ? 2 : 1,
				[
					engine != null
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
							iconName: engine == null ? "fa-solid fa-plus" : "fa-solid fa-save",
							text: engine == null ? "Create" : "Save",
						}),
				]),
		]);
}