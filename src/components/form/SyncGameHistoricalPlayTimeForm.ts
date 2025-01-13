//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { Button } from "../input/Button.js";
import { Checkbox } from "../input/Checkbox.js";
import { Control } from "../input/Control.js";

//
// Component
//

export type SyncGameHistoricalPlayTimeFormGame = Prisma.GameGetPayload<null>;

export function SyncGameHistoricalPlayTimeForm(game: SyncGameHistoricalPlayTimeFormGame)
{
	return new DE("form",
		{
			class: "component-sync-game-historical-play-time-form",
			autocomplete: "off",

			"data-game-id": game.id,
		},
		[
			Control(
				{
					type: "number",
					name: "steamAppId",
					required: true,
					value: game.steamAppId ?? null,
				}),

			Checkbox("updateFirstPlayedDate", "Update first played date", true),

			Checkbox("updateLastPlayedDate", "Update last played date", true),

			Button(
				{
					style: "success",
					type: "submit",
					iconName: "fa-solid fa-sync",
					text: "Sync historical playtime from Steam",
				}),
		]);
}