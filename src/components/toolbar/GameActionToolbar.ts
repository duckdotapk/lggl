//
// Imports
//

import { DE } from "@lorenstuff/document-builder";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { HumanDateTime } from "../basic/HumanDateTime.js";

import { Button } from "../input/Button.js";

import { DataList } from "../DataList.js";

import
{
	getGameCompletionStatusIconName,
	getGameCompletionStatusName,
} from "../../libs/models/Game.js";

import { formatSeconds } from "../../libs/Humanization.js";

//
// Component
//

export function GameActionToolbar
(
	game: Prisma.GameGetPayload<
	{
		include:
		{
			gameInstallations: true;
			gamePlayActions: true;
		};
	}>,
)
{
	const gameIsInstalled = game.gameInstallations.length > 0;
	const gameHasPlayActions = game.gamePlayActions.length > 0;

	return new DE("div", "component-game-action-toolbar",
	[
		new DE("div", "buttons",
			[
				!gameIsInstalled
					? Button(
					{
						style: "secondary",
						type: "button",
						extraAttributes:
						{
							disabled: true,
						},
						iconName: "fa-solid fa-ban",
						text: "Not installed",
					})
					: null,

				gameIsInstalled && !gameHasPlayActions
					? Button(
					{
						style: "secondary",
						type: "button",
						extraAttributes:
						{
							disabled: true,
						},
						iconName: "fa-solid fa-ban",
						text: "No play actions",
					})
					: null,

				gameIsInstalled && gameHasPlayActions
					? Button(
					{
						style: "success",
						type: "button",
						extraAttributes:
						{
							"data-open-choose-game-play-action-dialog": "true",
							"data-game-id": game.id,
						},
						iconName: "fa-solid fa-play",
						text: "Play",
					})
					: null,
			]),

		new DE("div", "data-list", DataList(
		[
			game.lastPlayedDate != null
				? {
					iconName: "fa-solid fa-calendar",
					name: "Last played",
					value: game.lastPlayedDate != null
						? HumanDateTime(DateTime.fromJSDate(game.lastPlayedDate), DateTime.DATE_MED)
						: "Never",
				}
				: null,

			game.playTimeTotalSeconds > 0
				? {
					iconName: "fa-solid fa-timer",
					name: "Play time",
					value: formatSeconds(game.playTimeTotalSeconds, false),
				}
				: null,

			game.progressionType != "NONE" && game.completionStatus != null
				? {
					iconName: getGameCompletionStatusIconName(game),
					name: "Completion status",
					value: getGameCompletionStatusName(game),
				}
				: null,
		])),

		new DE("div", "buttons",
		[
			Button(
				{
					style: "secondary",
					href: "/games/edit/" + game.id,
					extraAttributes:
					{
						"data-pjax-selector": "main",
					},
					iconName: "fa-solid fa-pen-to-square",
					text: "Edit",
				}),

			Button(
				{
					style: "secondary",
					href: "/gamePlaySessions/list/" + game.id,
					extraAttributes:
					{
						"data-pjax-selector": "main",
					},
					iconName: "fa-solid fa-list",
					text: "Play sessions",
				}),

			Button(
				{
					style: "warning",
					type: "button",
					extraAttributes:
					{
						"data-open-game-notes-dialog": "true",
						"data-game-id": game.id,
					},
					iconName: "fa-solid fa-sticky-note",
					text: game.notes == null
						? "Add notes"
						: "Edit notes",
				}),
		]),
	]);
}