//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { Anchor } from "./basic/Anchor.js";
import { Block } from "./basic/Block.js";
import { Header } from "./basic/Header.js";
import { HumanDateTime } from "./basic/HumanDateTime.js";
import { Paragraph } from "./basic/Paragraph.js";

import { DataList } from "./DataList.js";

import * as GameModelLib from "../libs/models/Game.js";

//
// Locals
//

function MissingData()
{
	return new DE("div", "component-game-details-missing-data", "null");
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
	const gameDevelopers = game.gameCompanies.filter((gameCompany) => gameCompany.type == "DEVELOPER");

	const gamePublishers = game.gameCompanies.filter((gameCompany) => gameCompany.type == "PUBLISHER");

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

	return new DE("div", "component-game-details", new DE("div", "wrapper",
		[
			// Notes
			game.notes != null
				? Block(
					[
						Header(3,
							[
								new DE("span", "fa-solid fa-sticky-note"),
								" Notes",
							]),

						game.notes.split("\n").map((line) => Paragraph(line)),
					])
				: null,

			// Description
			Block(
				[
					Header(3,
						[
							new DE("span", "fa-solid fa-info-circle"),
							" Description",
						]),

					game.description != null
						? game.description.split("\n").map((line) => Paragraph(line))
						: MissingData(),
				]),

			// Release date
			Block(
				[
					Header(3,
						[
							new DE("span", "fa-solid fa-calendar"),
							" Release date",
						]),

					game.isUnreleased 
						? Paragraph("Unreleased")
						: null,

					game.releaseDate != null
						? Paragraph(HumanDateTime(DateTime.fromJSDate(game.releaseDate), DateTime.DATE_MED))
						: null,

					game.releaseDate == null
						? MissingData()
						: null,
				]),

			// Developers
			Block(
				[
					Header(3,
						[
							new DE("span", "fa-solid fa-code"),
							" ",
							gameDevelopers.length > 1 ? "Developers" : "Developer",
						]),

					gameDevelopers.length > 0
						? DataList(gameDevelopers.map((gameDeveloper) =>
							({
								name: Anchor(gameDeveloper.company.name, "/companies/view/" + gameDeveloper.company.id),
								value: gameDeveloper.notes,
							})))
						: MissingData(),
				]),

			// Publishers
			Block(
				[
					Header(3,
						[
							new DE("span", "fa-solid fa-building"),
							" ",
							gamePublishers.length > 1 ? "Publishers" : "Publisher",
						]),

					gamePublishers.length > 0
						? DataList(gamePublishers.map((gamePublisher) =>
							({
								name: Anchor(gamePublisher.company.name, "/companies/view/" + gamePublisher.company.id),
								value: gamePublisher.notes,
							})))
						: MissingData(),
				]),

			// Platforms
			Block(
				[
					Header(3,
						[
							new DE("span", "fa-solid fa-layer-group"),
							" ",
							game.gamePlatforms.length > 1 ? "Platforms" : "Platform",
						]),

					game.gamePlatforms.length > 0
						? DataList(game.gamePlatforms.map((gamePlatform) =>
							({
								iconName: gamePlatform.platform.iconName,
								name: Anchor(gamePlatform.platform.name, "/platforms/view/" + gamePlatform.platform.id),
								value: null,
							})))
						: MissingData(),
				]),

			// Engines
			Block(
				[
					Header(3,
						[
							new DE("span", "fa-solid fa-engine"),
							" ",
							game.gameEngines.length > 1 ? "Engines" : "Engine",
						]),

					game.gameEngines.length > 0
						? DataList(game.gameEngines.map((gameEngine) =>
							({
								name: Anchor(
									[
										gameEngine.engine.shortName ?? gameEngine.engine.name,
										gameEngine.version != null ? [ " ", gameEngine.version ] : null,
									],
									"/engines/view/" + gameEngine.engine.id),
								value: gameEngine.notes,
							})))
						: DataList(
							[
								{
									name: game.isUnknownEngine ? "Unknown" : MissingData(),
									value: null,
								},
							]),
				]),

			// Features
			Block(
				[
					Header(3,
						[
							new DE("span", "fa-solid fa-tools"),
							" Features",
						]),

					DataList(
						[
							{
								name: "Progression type",
								value: game.progressionType != null
									? GameModelLib.getProgressionTypeName(game)
									: MissingData(),
							},
							{
								name: "Achievement support",
								value: game.achievementSupport != null
									? GameModelLib.getAchievementSupportName(game)
									: MissingData(),
							},
							{
								name: "Controller support",
								value: game.controllerSupport != null
									? GameModelLib.getControllerSupportName(game)
									: MissingData(),
							},
							{
								name: "Mod support",
								value: game.modSupport != null
									? GameModelLib.getModSupportName(game)
									: MissingData(),
							},
							{
								name: "VR support",
								value: game.virtualRealitySupport != null
									? GameModelLib.getVirtualRealitySupportName(game)
									: MissingData(),
							},
						]),
				]),

			// Links
			links.length > 0
				? Block(
					[
						Header(3,
							[
								new DE("span", "fa-solid fa-link"),
								" ",
								links.length > 1 ? "Links" : "Link",
							]),

						DataList(links.map(
							(link) =>
							({
								name: Anchor(link.title, link.url, "_blank"), 
								value: null 
							}))),
					])
				: null,

			// Steam app
			game.steamAppId != null
				? Block(
					[
						Header(3,
							[
								new DE("span", "fa-brands fa-steam"),
								" Steam app",
							]),

						DataList(
							[
								{
									iconName: "fa-solid fa-fingerprint",
									name: "ID",
									value: game.steamAppId,
								},
								{
									iconName: "fa-solid fa-text",
									name: "Name",
									value: game.steamAppName ?? MissingData(),
								},
							]),
					])
				: null,

			// Game
			Block(
				[
					Header(3,
						[
							new DE("span", "fa-solid fa-gamepad-modern"),
							" Game",
						]),
			
					DataList(
						[
							{
								iconName: "fa-solid fa-fingerprint",
								name: "ID",
								value: game.id,
							},
							{
								iconName: "fa-solid fa-calendar",
								name: "Created",
								value: HumanDateTime(DateTime.fromJSDate(game.createdDate)),
							},
							{
								iconName: "fa-solid fa-rotate",
								name: "Last updated",
								value: HumanDateTime(DateTime.fromJSDate(game.lastUpdatedDate)),
							}
						]),
				]),
		]));
}