//
// Imports
//

import { DE } from "@lorenstuff/document-builder";
import { Prisma } from "@prisma/client";

import { Button } from "../input/Button.js";
import { Control } from "../input/Control.js";
import { Label } from "../input/Label.js";

import { ColumnLayout } from "../layout/ColumnLayout.js";

//
// Component
//

export function UpsertSeriesGameForm
(
	games: Prisma.GameGetPayload<null>[],
	series: Prisma.SeriesGetPayload<null>,
	seriesGame: Prisma.SeriesGameGetPayload<null> | null,
)
{
	return new DE("form",
		{
			class: "component-upsert-series-game-form",
			autocomplete: "off",

			"data-series-id": series.id,
			"data-series-game-id": seriesGame?.id ?? null,
		},
		[
			ColumnLayout(2,
			[
				new DE("div", null,
				[
					Label("game_id", "Game"),
					Control(
					{
						type: "select",
						name: "game_id",
						required: true,
						value: seriesGame?.game_id,
						showEmptyOption: true,
						options: games.map((game) =>
						({
							value: game.id,
							label: game.name,
						})),
					}),
				]),

				new DE("div", null,
				[
					Label("number", "Number"),
					Control(
					{
						type: "number",
						name: "number",
						required: true,
						value: seriesGame?.number,
					}),
				]),
			]),

			ColumnLayout(seriesGame != null ? 2 : 1,
			[
				seriesGame != null
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
					iconName: seriesGame == null
						? "fa-solid fa-plus"
						: "fa-solid fa-save",
					text: seriesGame == null
						? "Create"
						: "Save",
				}),
			]),
		]);
}