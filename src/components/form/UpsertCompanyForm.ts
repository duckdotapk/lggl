//
// Imports
//

import { DE } from "@lorenstuff/document-builder";
import { Prisma } from "@prisma/client";

import { Block } from "../basic/Block.js";

import { Button } from "../input/Button.js";
import { Control } from "../input/Control.js";
import { Label } from "../input/Label.js";

import { ColumnLayout } from "../layout/ColumnLayout.js";

//
// Component
//

export function UpsertCompanyForm(company: Prisma.CompanyGetPayload<null> | null)
{
	return new DE("form",
		{
			class: "component-upsert-company-form",
			autocomplete: "off",

			"data-company-id": company?.id,
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
					value: company?.name,
				}),
			]),

			ColumnLayout(company != null ? 2 : 1,
			[
				company != null
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
					iconName: company == null
						? "fa-solid fa-plus"
						: "fa-solid fa-save",
					text: company == null
						? "Create"
						: "Save",
				}),
			]),
		],
	);
}