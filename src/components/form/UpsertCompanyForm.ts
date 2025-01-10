//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { Button } from "../input/Button.js";
import { Control } from "../input/Control.js";
import { Label } from "../input/Label.js";

import { Columns } from "../layout/Columns.js";

//
// Component
//

export type UpsertCompanyFormCompany = Prisma.CompanyGetPayload<null> | null;

export function UpsertCompanyForm(company: UpsertCompanyFormCompany)
{
	return new DE("form",
		{
			class: "component-upsert-company-form",
			autocomplete: "off",

			"data-company-id": company?.id,
		},
		[
			Label("name", "Name"),

			Control(
				{
					type: "text",
					name: "name",
					required: true,
					placeholder: "Company name",
					value: company?.name,
				}),

			Columns(company != null ? 2 : 1,
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
							iconName: company == null ? "fa-solid fa-plus" : "fa-solid fa-save",
							text: company == null ? "Create" : "Save",
						}),
				]),
		]);
}