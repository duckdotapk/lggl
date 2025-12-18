//
// Imports
//

import { DE } from "@lorenstuff/document-builder";
import { Prisma } from "@prisma/client";

import { Button } from "../input/Button.js";
import { Control } from "../input/Control.js";
import { Label } from "../input/Label.js";

//
// Component
//

export function DownloadGameImagesForm(game: Prisma.GameGetPayload<null>)
{
	return new DE("form",
		{
			class: "component-download-game-images-form",
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

			Button(
			{
				style: "success",
				type: "submit",
				iconName: "fa-solid fa-download",
				text: "Download missing images from steam",
			}),
		],
	);
}