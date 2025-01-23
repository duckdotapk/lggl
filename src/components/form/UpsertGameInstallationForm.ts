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

export type UpsertGameInstallationFormOptions =
{
	directories: Prisma.DirectoryGetPayload<null>[];
	game: Prisma.GameGetPayload<null>;
	gameInstallation: Prisma.GameInstallationGetPayload<null> | null;
};

export function UpsertGameInstallationForm(options: UpsertGameInstallationFormOptions)
{
	return new DE("form",
		{
			class: "component-upsert-game-installation-form",
			autocomplete: "off",

			"data-game-id": options.game.id,
			"data-game-installation-id": options.gameInstallation?.id ?? null,
		},
		[
			ColumnLayout(2,
				[
					new DE("div", null,
						[
							Label("directoryId", "Directory"),

							Control(
								{
									type: "select",
									name: "directoryId",
									required: false,
									showEmptyOption: true,
									value: options.gameInstallation?.directory_id,
									options: options.directories.map(directory =>
										({
											value: directory.id,
											label: directory.name + " (" + directory.path + ")",
										})),
								}),
						]),

					new DE("div", null,
						[
							Label("path", "Path"),

							Control(
								{
									type: "text",
									name: "path",
									required: true,
									value: options.gameInstallation?.path,
									placeholder: "Path",
								}),
						]),
				]),

			ColumnLayout(options.gameInstallation != null ? 2 : 1,
				[
					options.gameInstallation != null
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
							iconName: options.gameInstallation == null ? "fa-solid fa-plus" : "fa-solid fa-save",
							text: options.gameInstallation == null ? "Create" : "Save",
						}),
				]),
		]);
}