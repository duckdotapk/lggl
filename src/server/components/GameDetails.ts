//
// Imports
//

import { Child, DE } from "@donutteam/document-builder";
import * as Utilities from "@donutteam/utilities";
import { Prisma } from "@prisma/client";
import humanizeDuration from "humanize-duration";
import { DateTime } from "luxon";

import { Button } from "./Button.js";
import { HumanDateTime } from "./HumanDateTime.js";

import { staticMiddleware } from "../instances/server.js";

//
// Locals
//

function Header(game: GameDetailsGame)
{
	return new DE("header",
		{
			class: "component-game-details-header",
		},
		[
			game.bannerImagePath != null
				? new DE("img",
					{
						class: "image",
			
						src: staticMiddleware.getCacheBustedPath(game.bannerImagePath),
						alt: game.name + " banner",
					})
				: null,

			game.logoImagePath != null
				? new DE("img",
					{
						class: "logo",

						src: staticMiddleware.getCacheBustedPath(game.logoImagePath),
						alt: game.name + " logo",
					})
				: new DE("div", "name", game.name),
		]);
}

function PlayActionButtonGroup(game: GameDetailsGame)
{
	return new DE("div",
		{
			class: "component-game-details-play-action-button-group",
		},
		[
			game.gamePlayActions.length == 0
				? Button("No play actions available",
					{
						disabled: true,
					})
				: game.gamePlayActions.map((gamePlayAction) => Button(gamePlayAction.name,
					{
						"data-game-play-action-id": gamePlayAction.id,
					})),
		]);
}

function Section(text: string, children: Child)
{
	return new DE("section", "component-game-details-section",
		[
			new DE("header", "header", text),

			children,
		]);
}

type DataTableRow =
{
	label: Child;
	value: Child;
};

function DataTable(rows: DataTableRow[])
{
	return new DE("table", "component-game-details-data-table",
		[
			rows.map((row) => new DE("tr", null,
				[
					new DE("td", "label", row.label),

					new DE("td", "value", row.value),
				])),
		]);
}

//
// Component
//

export type GameDetailsGame = Prisma.GameGetPayload<
	{
		include:
		{
			gamePlayActions: true;
		};
	}>;

export type GameDetailsRecentGamePlayActionSessions = Prisma.GamePlayActionSessionGetPayload<null>[];

export function GameDetails(game: GameDetailsGame, recentGamePlayActionSessions: GameDetailsRecentGamePlayActionSessions)
{
	return new DE("div", 
		{
			class: "component-game-details",
			
			"data-game-id": game.id,
		},
		[
			Header(game),

			PlayActionButtonGroup(game),

			new DE("div", "details-sections",
				[
					Section("Details",
						[
							DataTable(
								[
									{
										label: "Time played",
										value: game.playTimeTotalSeconds > 0
											? new DE("span",
												{
													title: Utilities.NumberLib.format(game.playTimeTotalSeconds) + " seconds",
												},
												[
													humanizeDuration(game.playTimeTotalSeconds * 1000),
												])
											: "No playtime recorded",
									},
									{
										label: "Last played",
										value: game.lastPlayedDate != null
											? new DE("span",
												{
													title: DateTime.fromJSDate(game.lastPlayedDate).toLocaleString(DateTime.DATETIME_MED),
												},
												[
													HumanDateTime(DateTime.fromJSDate(game.lastPlayedDate)),
												])
											: "Never played",
									},
									{
										label: "Steam app ID",
										value: game.steamAppId != null
											? game.steamAppId
											: "-",
									},
								]),
						]),

					Section("Recent play sessions",
						[
							DataTable(recentGamePlayActionSessions.map(
								(gamePlayActionSession) =>
								{
									return {
										label: !gamePlayActionSession.isHistorical
											? HumanDateTime(DateTime.fromJSDate(gamePlayActionSession.startDate))
											: "Historical",
										value: humanizeDuration(gamePlayActionSession.playTimeSeconds * 1000),
									};
								})),
						]),
				]),
		]);
}