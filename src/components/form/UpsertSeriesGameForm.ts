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

export type UpsertSeriesGameFormOptions =
{
	games: Prisma.GameGetPayload<null>[];
	series: Prisma.SeriesGetPayload<null>;
	seriesGame: Prisma.SeriesGameGetPayload<null> | null;
}

export function UpsertSeriesGameForm(options: UpsertSeriesGameFormOptions)
{
	return new DE("form",
		{
			class: "component-upsert-series-game-form",
			autocomplete: "off",

			"data-series-id": options.series.id,
			"data-series-game-id": options.seriesGame?.id ?? null,
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
									value: options.seriesGame?.game_id,
									showEmptyOption: true,
									options: options.games.map((game) => ({ value: game.id, label: game.name }))
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
									value: options.seriesGame?.number,
								}),
						]),
				]),

			ColumnLayout(options.seriesGame != null ? 2 : 1,
				[
					options.seriesGame != null
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
							iconName: options.seriesGame == null ? "fa-solid fa-plus" : "fa-solid fa-save",
							text: options.seriesGame == null ? "Create" : "Save",
						}),
				]),
		]);
}