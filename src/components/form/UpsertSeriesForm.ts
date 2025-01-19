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

export type UpsertSeriesFormSeries = Prisma.SeriesGetPayload<null> | null;

export function UpsertSeriesForm(series: UpsertSeriesFormSeries)
{
	return new DE("form",
		{
			class: "component-upsert-series-form",
			autocomplete: "off",

			"data-series-id": series?.id,
		},
		[
			Block(
				[
					Label("name", "Name"),
		
					Control(
						{
							type: "text",
							name: "name",
							required: true,
							placeholder: "Name",
							value: series?.name,
						}),
				]),

			ColumnLayout(series != null ? 2 : 1,
				[
					series != null
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
							iconName: series == null ? "fa-solid fa-plus" : "fa-solid fa-save",
							text: series == null ? "Create" : "Save",
						}),
				]),
		]);
}