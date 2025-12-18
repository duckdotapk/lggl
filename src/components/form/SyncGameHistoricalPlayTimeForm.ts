//
// Imports
//

import { DE } from "@lorenstuff/document-builder";
import { Prisma } from "@prisma/client";

import { Button } from "../input/Button.js";
import { Checkbox } from "../input/Checkbox.js";
import { Control } from "../input/Control.js";
import { Label } from "../input/Label.js";

//
// Component
//

export function SyncGameHistoricalPlayTimeForm(game: Prisma.GameGetPayload<null>)
{
	return new DE("form",
		{
			class: "component-sync-game-historical-play-time-form",
			autocomplete: "off",

			"data-game-id": game.id,
		},
		[
			Label("steamAppId", "Steam app ID"),

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
		],
	);
}