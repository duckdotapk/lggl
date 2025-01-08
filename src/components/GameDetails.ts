//
// Imports
//

import { Child, DE } from "@donutteam/document-builder";
import * as Utilities from "@donutteam/utilities";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { Anchor } from "./inline/Anchor.js";
import { HumanDateTime } from "./inline/HumanDateTime.js";

import { Button } from "./Button.js";
import { Checkbox } from "./Checkbox.js";
import { Paragraph } from "./Paragraph.js";

import { LGGL_DEVELOPER_MODE } from "../env/LGGL_DEVELOPER_MODE.js";
import { LGGL_GAME_PLAY_SESSION_HISTORY_DAYS } from "../env/LGGL_GAME_PLAY_SESSION_HISTORY_DAYS.js";

import { shortEnglishHumanizer } from "../instances/humanizer.js";
import { staticMiddleware } from "../instances/server.js";

import * as GameModelLib from "../libs/models/Game.js";

import * as GameCompanySchemaLib from "../libs/schemas/GameCompany.js";

//
// Locals
//

function Banner(game: GameDetailsGame)
{
	const imageUrls = GameModelLib.getImageUrls(game);

	return new DE("header",
		{
			class: "component-game-details-banner",
		},
		[
			game.hasBannerImage
				? new DE("img",
					{
						class: "image",
			
						src: staticMiddleware.getCacheBustedPath(imageUrls.banner),
						alt: game.name + " banner",
					})
				: null,

			game.hasLogoImage
				? new DE("img",
					{
						class: "logo",

						src: staticMiddleware.getCacheBustedPath(imageUrls.logo),
						alt: game.name + " logo",
					})
				: new DE("div", "name", game.name),
		]);
}

function PlayActionButtonGroup(game: GameDetailsGame)
{
	let children: Child;

	if (!game.isInstalled)
	{
		children = Button(
			{
				text: "Not installed",
				extraAttributes:
				{
					disabled: true,
				},
			});
	}
	else if (game.gamePlayActions.length == 0)
	{
		children = Button(
			{
				text: "No play actions available",
				extraAttributes:
				{
					disabled: true,
				},
			});
	}
	else
	{
		children = game.gamePlayActions.map((gamePlayAction) => Button(
			{
				iconName: "fa-solid fa-play",
				text: gamePlayAction.name,
				extraAttributes:
				{
					"data-game-play-action-id": gamePlayAction.id,
				},
			}));
	}

	return new DE("div",
		{
			class: "component-game-details-play-action-button-group",
		},
		[
			children,
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
			gameCompanies:
			{
				include:
				{
					company: true;
				};
			};
			gameEngines:
			{
				include:
				{
					engine: true;
				};
			};
			gameLinks: true;
			gamePlayActions: true;
			gamePlaySessions:
			{
				include:
				{
					platform: true;
				};
			};
		};
	}>;

export function GameDetails(game: GameDetailsGame)
{
	const gameDevelopers = game.gameCompanies.filter((gameCompany) => gameCompany.type == "DEVELOPER" satisfies GameCompanySchemaLib.Type);

	const gamePublishers = game.gameCompanies.filter((gameCompany) => gameCompany.type == "PUBLISHER" satisfies GameCompanySchemaLib.Type);

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

	for (const gameLink of game.gameLinks)
	{
		links.push(
			{
				title: gameLink.title,
				url: gameLink.url,
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

			// TODO: this is getting a little bloated and arbitrarily sorted, probably restructure this at some point
			new DE("div", "details-sections",
				[
					Section("Play data",
						[
							DataTable(
								[
									game.completionStatus != null
										? {
											label: "Completion status",
											value: GameModelLib.getCompletionStatusName(game),
										}
										: null,

									{
										label: "Total time played",
										value: game.playTimeTotalSeconds > 0
											? new DE("span",
												{
													title: Utilities.NumberLib.format(game.playTimeTotalSeconds) + " seconds",
												},
												[
													shortEnglishHumanizer(game.playTimeTotalSeconds * 1000),
												])
											: "No playtime recorded",
									},
									{
										label: "Date last played",
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

									game.firstCompletedDate != null
										? buildDateDataTableRow(game.firstCompletedDate, game.firstCompletedDateApproximated, "completed")
										: null,
									
									game.firstPlayedDate != null
										? buildDateDataTableRow(game.firstPlayedDate, game.firstPlayedDateApproximated, "played")
										: null,
								]), 
						]),

					Section("Recent play sessions",
						[
							game.gamePlaySessions.length > 0
								? DataTable(game.gamePlaySessions.map(
									(gamePlaySession) =>
									{
										let title = "Played for " + Utilities.NumberLib.format(gamePlaySession.playTimeSeconds) + " seconds on " + gamePlaySession.platform.name;

										if (gamePlaySession.notes != null)
										{
											title += "\n\n" + gamePlaySession.notes;
										}

										if (LGGL_DEVELOPER_MODE)
										{
											title += "\n\nGamePlaySession #" + gamePlaySession.id;
										}

										return {
											label: !gamePlaySession.isHistorical
												? HumanDateTime(DateTime.fromJSDate(gamePlaySession.startDate))
												: "Historical",
											value: new DE("span",
												{
													title,
												},
												[
													new DE("span", gamePlaySession.platform.iconName + " fa-fw"),
													" ",
													shortEnglishHumanizer(gamePlaySession.playTimeSeconds * 1000),
												]),
										};
									}))
								: Paragraph(LGGL_GAME_PLAY_SESSION_HISTORY_DAYS != -1
									? "No play sessions in the last " + LGGL_GAME_PLAY_SESSION_HISTORY_DAYS + " days."
									: "No play sessions recorded."),
						]),

					Section("Info",
						[
							DataTable(
								[
									{
										label: "Name",
										value: game.name,
									},
									{
										label: "Release date",
										value: game.releaseDate != null
											? HumanDateTime(DateTime.fromJSDate(game.releaseDate), DateTime.DATE_MED)
											: "Unreleased",
									},
									{
										label: gameDevelopers.length > 1
											? "Developers"
											: "Developer",
										value: gameDevelopers.length > 0
											? gameDevelopers.map(
												(gameDeveloper) =>
												{
													let text = gameDeveloper.company.name;

													if (gameDeveloper.notes != null)
													{
														text += "*";
													}

													return Paragraph(new DE("span", { title: gameDeveloper.notes }, text));
												})
											: "-",
									},
									{
										label: gamePublishers.length > 1
											? "Publishers"
											: "Publisher",
										value: gamePublishers.length > 0
											? gamePublishers.map(
												(gamePublisher) =>
												{
													let text = gamePublisher.company.name;

													if (gamePublisher.notes != null)
													{
														text += "*";
													}

													return Paragraph(new DE("span", { title: gamePublisher.notes }, text));
												})
											: "-",
									},
									{
										label: game.gameEngines.length > 1
											? "Engines"
											: "Engine",
										value: game.gameEngines.length > 0
											? game.gameEngines.map(
												(gameEngine) =>
												{
													let text = gameEngine.engine.shortName ?? gameEngine.engine.name;

													if (gameEngine.version != null)
													{
														text += " " + gameEngine.version;
													}

													if (gameEngine.notes != null)
													{
														text += "*";
													}

													let tooltip = gameEngine.engine.name;

													if (gameEngine.notes != null)
													{
														tooltip += "\n\n" + gameEngine.notes;
													}

													return Paragraph(new DE("span", { title: tooltip }, text));
												})
											: "-",
									}
								]),
						]),

					Section("Description",
						[
							game.description != null
								? game.description.split("\n").map((line) => Paragraph(line))
								: Paragraph("No description available."),
						]),

					Section("Features",
						[
							DataTable(
								[
									{
										label: "Progression type",
										value: GameModelLib.getProgressionTypeName(game),
									},
									{
										label: "Achievement support",
										value: GameModelLib.getAchievementSupportName(game),
									},
									{
										label: "Controller support",
										value: GameModelLib.getControllerSupportName(game),
									},
									{
										label: "Mod support",
										value: GameModelLib.getModSupportName(game),
									},
									{
										label: "VR support",
										value: GameModelLib.getVirtualRealitySupportName(game),
									},
								]),
						]),

					Section("Flags",
						[
							Paragraph(Checkbox("isEarlyAccess", "Is Early Access", game.isEarlyAccess)),

							Paragraph(Checkbox("isFavorite", "Is Favorite", game.isFavorite)),

							Paragraph(Checkbox("isHidden", "Is Hidden", game.isHidden)),

							Paragraph(Checkbox("isNsfw", "Is NSFW", game.isNsfw)),
							
							Paragraph(Checkbox("isShelved", "Is Shelved", game.isShelved)),
						]),

					links.length > 0
						? Section("Links", links.map((link) => Paragraph(Anchor(link.title, link.url, "_blank"))))
						: null,

					game.notes != null
						? Section("Notes",
							[
								// TODO: render as markdown instead
								game.notes.split("\n").map((line) => Paragraph(line)),
							])
						: null,

					game.steamAppId != null
						? Section("Steam app",
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

					Section("Library",
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
								])
						]),
				]),
		]);
}