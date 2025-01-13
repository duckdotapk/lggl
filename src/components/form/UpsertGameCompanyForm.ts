//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { Button } from "../input/Button.js";
import { Control } from "../input/Control.js";
import { Label } from "../input/Label.js";

import { ColumnLayout } from "../layout/ColumnLayout.js";

import * as GameCompanyModelLib from "../../libs/models/GameCompany.js";

import * as GameCompanySchemaLib from "../../libs/schemas/GameCompany.js";

//
// Component
//

export type UpsertGameCompanyFormOptions =
{
	companies: Prisma.CompanyGetPayload<null>[];
	game: Prisma.GameGetPayload<null>;
	gameCompany: Prisma.GameCompanyGetPayload<{ include: { company: true } }> | null;
}

export function UpsertGameCompanyForm(options: UpsertGameCompanyFormOptions)
{
	return new DE("form",
		{
			class: "component-upsert-game-company-form",
			autocomplete: "off",

			"data-game-id": options.game.id,
			"data-game-company-id": options.gameCompany?.id ?? null,
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
									value: options.gameCompany?.company_id,
									options: options.companies.map((company) => ({ value: company.id, label: company.name }))
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
									value: options.gameCompany?.type,
									options: GameCompanySchemaLib.TypeSchema.options.map((type) => ({ value: type, label: GameCompanyModelLib.getTypeName(type) }))
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
									value: options.gameCompany?.notes,
								}),
						]),
				]),

			ColumnLayout(options.gameCompany != null ? 2 : 1,
				[
					options.gameCompany != null
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
							iconName: options.gameCompany == null ? "fa-solid fa-plus" : "fa-solid fa-save",
							text: options.gameCompany == null ? "Create" : "Save",
						}),
				]),
		]);
}