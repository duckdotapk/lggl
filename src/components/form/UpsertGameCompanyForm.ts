//
// Imports
//

import { DE } from "@lorenstuff/document-builder";
import { $Enums, Prisma } from "@prisma/client";

import { Button } from "../input/Button.js";
import { Control } from "../input/Control.js";
import { Label } from "../input/Label.js";

import { ColumnLayout } from "../layout/ColumnLayout.js";

import { getGameCompanyTypeName } from "../../libs/models/GameCompany.js";

//
// Component
//

export function UpsertGameCompanyForm
(
	companies: Prisma.CompanyGetPayload<null>[],
	game: Prisma.GameGetPayload<null>,
	gameCompany: Prisma.GameCompanyGetPayload<
	{
		include:
		{
			company: true;
		};
	}> | null,
)
{
	return new DE("form",
		{
			class: "component-upsert-game-company-form",
			autocomplete: "off",

			"data-game-id": game.id,
			"data-game-company-id": gameCompany?.id ?? null,
		},
		[
			ColumnLayout(3,
			[
				new DE("div", null,
				[
					Label("company_id", "Company"),

					Control(
					{
						type: "select",
						name: "company_id",
						required: true,
						value: gameCompany?.company_id,
						showEmptyOption: true,
						options: companies.map((company) =>
						({
							value: company.id,
							label: company.name,
						})),
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
						value: gameCompany?.type,
						showEmptyOption: true,
						options: Object.values($Enums.GameCompanyType).map((type) =>
						({
							value: type,
							label: getGameCompanyTypeName(type),
						})),
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
						value: gameCompany?.notes,
					}),
				]),
			]),

			ColumnLayout(gameCompany != null ? 2 : 1,
			[
				gameCompany != null
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
					iconName: gameCompany == null
						? "fa-solid fa-plus"
						: "fa-solid fa-save",
					text: gameCompany == null
						? "Create"
						: "Save",
				}),
			]),
		],
	);
}