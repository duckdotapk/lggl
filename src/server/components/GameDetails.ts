//
// Imports
//

import { Child, DE } from "@donutteam/document-builder";
import * as Utilities from "@donutteam/utilities";
import { Prisma } from "@prisma/client";
import humanizeDuration from "humanize-duration";
import { DateTime } from "luxon";

import { Anchor } from "./Anchor.js";
import { Button } from "./Button.js";
import { GameFlagsToolbar } from "./GameFlagsToolbar.js";
import { HumanDateTime } from "./HumanDateTime.js";
import { Paragraph } from "./Paragraph.js";

import { staticMiddleware } from "../instances/server.js";

import { configuration } from "../../_shared/libs/Configuration.js";

//
// Locals
//

function Banner(game: GameDetailsGame)
{
	return new DE("header",
		{
			class: "component-game-details-banner",
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

function Header(text: string)
{
	return new DE("header", "component-game-details-header", text);
}

function Section(headerText: string, children: Child)
{
	return new DE("section", "component-game-details-section",
		[
			Header(headerText),

			children,
		]);
}

type DataTableRow =
{
	label: Child;
	value: Child;
};

function DataTable(rows: (DataTableRow | null)[])
{
	return new DE("table", "component-game-details-data-table",
		[
			rows
				.filter((row) => row != null)	
				.map((row) => new DE("tr", null,
				[
					new DE("td", "label", row.label),

					new DE("td", "value", row.value),
				])),
		]);
}

function buildDateDataTableRow(date: Date, isApproximated: boolean, verb: "played" | "completed")
{
	const label = (isApproximated ? "Year " : "Date ") + " first " + verb;

	let value: Child;

	if (DateTime.fromJSDate(date).toSeconds() == 0)
	{
		value = "Unknown";
	}
	else if (isApproximated)
	{
		value = DateTime.fromJSDate(date).year.toString();
	}
	else
	{
		value = HumanDateTime(DateTime.fromJSDate(date), DateTime.DATE_MED);
	}

	return { label, value } satisfies DataTableRow;
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

export type GameDetailsRecentGamePlayActionSessions = Prisma.GamePlayActionSessionGetPayload<
	{
		include:
		{
			platform: true;
		};
	}>[];

export function GameDetails(game: GameDetailsGame, recentGamePlayActionSessions: GameDetailsRecentGamePlayActionSessions)
{
	const links: { title: string; url: string }[] = [];

	if (game.steamAppId != null)
	{
		links.push(
			{
				title: "Steam Store Page",
				url: "https://store.steampowered.com/app/" + game.steamAppId,
			});

		links.push(
			{
				title: "SteamDB Page",
				url: "https://steamdb.info/app/" + game.steamAppId,
			});

		links.push(
			{
				title: "PC Gaming Wiki Page",

				// Note: This is a URL they have that will redirect to the correct page, pretty neat
				url: "https://www.pcgamingwiki.com/api/appid.php?appid=" + game.steamAppId,
			});
	}

	return new DE("div", 
		{
			class: "component-game-details",
			
			"data-game-id": game.id,
		},
		[
			Banner(game),

			PlayActionButtonGroup(game),

			GameFlagsToolbar(game),

			new DE("div", "details-sections",
				[
					Section("Play data",
						[
							DataTable(
								[
									game.completionStatus != null
										? {
											label: "Completion status",
											value: game.completionStatus, // TODO: map enum value to a friendly string
										}
										: null,

									{
										label: "Time played",
										value: game.playTimeTotalSeconds > 0
											? new DE("span",
												{
													title: Utilities.NumberLib.format(game.playTimeTotalSeconds) + " seconds",
												},
												[
													humanizeDuration(game.playTimeTotalSeconds * 1000, { units: [ "h", "m", "s" ] }),
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
									
									game.firstPlayedDate != null
										? buildDateDataTableRow(game.firstPlayedDate, game.firstPlayedDateApproximated, "played")
										: null,

									game.firstCompletedDate != null
										? buildDateDataTableRow(game.firstCompletedDate, game.firstCompletedDateApproximated, "completed")
										: null,

									game.lastPlayedDate != null
										? {
											label: "Date last played",
											value: HumanDateTime(DateTime.fromJSDate(game.lastPlayedDate), DateTime.DATE_MED),
										}
										: null,
								]), 
						]),

					Section("Recent play sessions",
						[
							recentGamePlayActionSessions.length > 0
								? DataTable(recentGamePlayActionSessions.map((gamePlayActionSession) =>
									{
										let title = "Played for " + Utilities.NumberLib.format(gamePlayActionSession.playTimeSeconds) + " seconds on " + gamePlayActionSession.platform.name;

										if (gamePlayActionSession.notes != null)
										{
											title += "\n\n" + gamePlayActionSession.notes;
										}

										if (configuration.developerMode)
										{
											title += "\n\nGamePlayActionSession #" + gamePlayActionSession.id;
										}

										return {
											label: !gamePlayActionSession.isHistorical
												? HumanDateTime(DateTime.fromJSDate(gamePlayActionSession.startDate))
												: "Historical",
											value: new DE("span",
												{
													title,
												},
												[
													new DE("span", gamePlayActionSession.platform.iconName + " fa-fw"),
													" ",
													humanizeDuration(gamePlayActionSession.playTimeSeconds * 1000, { units: [ "h", "m", "s" ] }),
												]),
										};
									}))
								: Paragraph(configuration.gamePlayActionSessionHistoryDays != -1
									? "No play sessions in the last " + configuration.gamePlayActionSessionHistoryDays + " days."
									: "No play sessions recorded."),
						]),

					game.description != null
						? Section("Description",
							[
								// TODO: render as markdown instead
								game.description.split("\n").map((line) => Paragraph(line)),
							])
						: null,

					Section("Metadata",
						[
							DataTable(
								[
									game.releaseDate != null
										? {
											label: "Release date",
											value: HumanDateTime(DateTime.fromJSDate(game.releaseDate), DateTime.DATE_MED),
										}
										: null,
									{
										label: "Progression type",
										value: game.progressionType, // TODO: map enum value to a friendly string
									},
								]),
						]),

					Section("Links",
						[
							links.map((link) => Paragraph(Anchor(link.title, link.url, "_blank"))),
						]),

					game.notes != null
						? Section("Notes",
							[
								// TODO: render as markdown instead
								game.notes.split("\n").map((line) => Paragraph(line)),
							])
						: null,

					game.steamAppId != null
						? Section("Steam data",
							[
								DataTable(
									[
										{
											label: "Steam app ID",
											value: game.steamAppId,
										},
										{
											label: "Steam app name",
											value: game.steamAppName,
										}
									]),
							])
						: null,

					Section("Library data",
						[
							DataTable(
								[
									{
										label: "ID",
										value: game.id,
									},
									{
										label: "Created",
										value: HumanDateTime(DateTime.fromJSDate(game.createdDate)),
									},
									{
										label: "Last updated",
										value: HumanDateTime(DateTime.fromJSDate(game.lastUpdatedDate)),
									},
									{
										label: "Sort order",
										value: game.sortOrder,
									},
								])
						]),
				]),
		]);
}