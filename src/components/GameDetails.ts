//
// Imports
//

import { Child, DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { Anchor } from "./basic/Anchor.js";
import { Header } from "./basic/Header.js";
import { HumanDateTime } from "./basic/HumanDateTime.js";
import { Muted } from "./basic/Muted.js";
import { Paragraph } from "./basic/Paragraph.js";

import { Button } from "./input/Button.js";

import { AutomaticColumnLayout } from "./layout/AutomaticColumnLayout.js";

import { DataList } from "./DataList.js";

import { shortEnglishHumanizer } from "../instances/humanizer.js";
import { staticMiddleware } from "../instances/server.js";

import * as GameModelLib from "../libs/models/Game.js";

import * as GameSchemaLib from "../libs/schemas/Game.js";
import * as GameCompanySchemaLib from "../libs/schemas/GameCompany.js";

//
// Locals
//

function Banner(game: GameDetailsGame)
{
	const imageUrls = GameModelLib.getImageUrls(game);

	let logoImageStyleComponents =
	[
		"--logo-image-alignment: " + (game.logoImageAlignment ?? "end"),
		"--logo-image-justification: " + (game.logoImageJustification ?? "start"),
	];

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
						style: logoImageStyleComponents.join("; "),

						src: staticMiddleware.getCacheBustedPath(imageUrls.logo),
						alt: game.name + " logo",
					})
				: new DE("div", "name", game.name),
		]);
}

function ActionToolbar(game: GameDetailsGame)
{
	return new DE("div", "component-game-details-action-bar",
		[
			new DE("div", "buttons",
				[
					!game.isInstalled
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
						: Button(
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
							}),
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
							value: shortEnglishHumanizer(game.playTimeTotalSeconds * 1000),
						}
						: null,

					game.progressionType != "NONE" satisfies GameSchemaLib.ProgressionType && game.completionStatus != null
						? {
							iconName: GameModelLib.getCompletionStatusIconName(game),
							name: "Completion status",
							value: GameModelLib.getCompletionStatusName(game),
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
							text: "Notes",
						}),
				]),
		]);
}

function Section(headerLevel: 1 | 2 | 3 | 4 | 5 | 6, headerText: string, children: Child)
{
	return new DE("section", "component-game-details-section",
		[
			Header(headerLevel, headerText),

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

					new DE("td", "value", row.value ?? new DE("div", "null", "null")),
				])),
		]);
}

function buildDescriptionSection(game: GameDetailsGame)
{
	if (game.description == null)
	{
		return null;
	}

	// TODO: render description as markdown
	return Section(3, "Description", game.description.split("\n").map((line) => Paragraph(line)));
}

function buildFeaturesSection(game: GameDetailsGame)
{
	return Section(3, "Features", DataTable(
		[
			{
				label: "Progression type",
				value: game.progressionType != null
					? GameModelLib.getProgressionTypeName(game)
					: null,
			},
			{
				label: "Achievement support",
				value: game.achievementSupport != null
					? GameModelLib.getAchievementSupportName(game)
					: null,
			},
			{
				label: "Controller support",
				value: game.controllerSupport != null
					? GameModelLib.getControllerSupportName(game)
					: null,
			},
			{
				label: "Mod support",
				value: game.modSupport != null
					? GameModelLib.getModSupportName(game)
					: null,
			},
			{
				label: "VR support",
				value: game.virtualRealitySupport != null
					? GameModelLib.getVirtualRealitySupportName(game)
					: null,
			},
		]));
}

function buildGeneralSection(game: GameDetailsGame)
{
	const dataTableRows: DataTableRow[] = [];

	dataTableRows.push(
		{
			label: "Name",
			value: game.name,
		});

	if (game.isUnreleased)
	{
		dataTableRows.push(
			{
				label: "Release date",
				value: "Unreleased",
			});
	}
	else if (game.releaseDate != null)
	{
		dataTableRows.push(
			{
				label: "Release date",
				value: HumanDateTime(DateTime.fromJSDate(game.releaseDate), DateTime.DATE_MED),
			});
	}
	else
	{
		dataTableRows.push(
			{
				label: "Release date",
				value: null,
			});
	}

	const gameDevelopers = game.gameCompanies.filter((gameCompany) => gameCompany.type == "DEVELOPER" satisfies GameCompanySchemaLib.Type);

	if (gameDevelopers.length > 0)
	{
		dataTableRows.push(
			{
				label: gameDevelopers.length > 1 ? "Developers" : "Developer",
				value: gameDevelopers.map((gameDeveloper) => Paragraph(
					[
						gameDeveloper.company.name,
						gameDeveloper.notes != null ? [ " ", Muted("(" + gameDeveloper.notes + ")") ] : null,
					])),
			});
	}
	else
	{
		dataTableRows.push(
			{
				label: "Developer",
				value: null,
			});
	}

	const gamePublishers = game.gameCompanies.filter((gameCompany) => gameCompany.type == "PUBLISHER" satisfies GameCompanySchemaLib.Type);

	if (gamePublishers.length > 0)
	{
		dataTableRows.push(
			{
				label: gamePublishers.length > 1 ? "Publishers" : "Publisher",
				value: gamePublishers.map((gamePublisher) => Paragraph(
					[
						gamePublisher.company.name,
						gamePublisher.notes != null ? [ " ", Muted("(" + gamePublisher.notes + ")") ] : null,
					])),
			});
	}
	else
	{
		dataTableRows.push(
			{
				label: "Publisher",
				value: null,
			});
	}

	if (game.gamePlatforms.length > 0)
	{
		dataTableRows.push(
			{
				label: game.gamePlatforms.length > 1 ? "Platforms" : "Platform",
				value: game.gamePlatforms.map((gamePlatform) => Paragraph(
					[
						new DE("span", gamePlatform.platform.iconName + " fa-fw"),
						" ",
						gamePlatform.platform.name,
					])),
			});
	}
	else
	{
		dataTableRows.push(
			{
				label: "Platform",
				value: null,
			});
	}

	if (game.isUnknownEngine)
	{
		dataTableRows.push(
			{
				label: "Engine",
				value: "Unknown",
			});
	}
	else if (game.gameEngines.length > 0)
	{
		dataTableRows.push(
			{
				label: game.gameEngines.length > 1 ? "Engines" : "Engine",
				value: game.gameEngines.map((gameEngine) => Paragraph(
					[
						gameEngine.engine.shortName ?? gameEngine.engine.name,
						gameEngine.version != null ? [ " ", gameEngine.version ] : null,
						gameEngine.notes != null ? [ " ", Muted("(" + gameEngine.notes + ")") ] : null,
					])),
			});
	}
	else
	{
		dataTableRows.push(
			{
				label: "Engine",
				value: null,
			});
	}

	return Section(3, "General", DataTable(dataTableRows));
}

function buildLibrarySection(game: GameDetailsGame)
{
	return Section(3, "Library", DataTable(
		[
			{
				label: "ID",
				value: game.id,
			},
			{
				label: "Created",
				value: HumanDateTime(DateTime.fromJSDate(game.createdDate), DateTime.DATE_MED),
			},
			{
				label: "Last updated",
				value: HumanDateTime(DateTime.fromJSDate(game.lastUpdatedDate), DateTime.DATE_MED),
			},
		]));
}

function buildLinksSection(game: GameDetailsGame)
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

		links.push(
			{
				title: "ProtonDB",
				url: "https://www.protondb.com/app/" + game.steamAppId,
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

	if (links.length == 0)
	{
		return null;
	}

	return Section(3, "Links", links.map((link) => Paragraph(Anchor(link.title, link.url, "_blank"))));
}

function buildSteamAppSection(game: GameDetailsGame)
{
	if (game.steamAppId == null)
	{
		return null;
	}

	return Section(3, "Steam app", DataTable(
		[
			{
				label: "Steam app ID",
				value: game.steamAppId,
			},
			{
				label: "Steam app name",
				value: game.steamAppName,
			}
		]));
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
			gamePlatforms:
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

	return new DE("div", 
		{
			class: "component-game-details",
			
			"data-game-id": game.id,
		},
		[
			Banner(game),

			ActionToolbar(game),

			new DE("div", "data", AutomaticColumnLayout("25rem",
				[
					buildGeneralSection(game),
					buildDescriptionSection(game),
					buildFeaturesSection(game),
					buildLinksSection(game),
					buildSteamAppSection(game),
					buildLibrarySection(game),
				])),
		]);
}