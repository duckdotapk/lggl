//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";

import { Button } from "../input/Button.js";
import { Control } from "../input/Control.js";
import { Label } from "../input/Label.js";

//
// Component
//

export type DownloadGameImagesFormGame = Prisma.GameGetPayload<null>;

export function DownloadGameImagesForm(game: DownloadGameImagesFormGame)
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
		]);
}