//
// Imports
//

import { DE } from "@donutteam/document-builder";
import * as Utilities from "@donutteam/utilities";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { HumanDateTime } from "./HumanDateTime.js";

import { staticMiddleware } from "../instances/server.js";

//
// Locals
//

function Item(game: SidebarGame, selectedGame: SidebarSelectedGame, searchParameters: URLSearchParams)
{
	let className = "component-sidebar-group-item";

	if (selectedGame != null && selectedGame.id == game.id)
	{
		className += " selected";
	}

	const itemSearchParameters = new URLSearchParams(searchParameters);

	itemSearchParameters.set("selectedGameId", game.id.toString());

	return new DE("a",
		{
			class: className,

			href: "/?" + itemSearchParameters.toString(),
		},
		[
			new DE("div", "icon-wrapper",
				[
					game.iconImagePath != null
						? new DE("img",
							{
								class: "icon image",
								src: staticMiddleware.getCacheBustedPath(game.iconImagePath),
								alt: game.name + " icon",
							})
						: new DE("div", "icon font-awesome",
							[
								new DE("span", "fa-solid fa-gamepad-modern fa-fw"),
							]),
				]),

			new DE("div", "text-wrapper",
				[
					new DE("div", "name", game.name),

					// TODO: make what details are shown here, or whether they are at all, configurable
					new DE("div", "details",
						[
							"Last played ",
							game.lastPlayedDate != null
								? HumanDateTime(DateTime.fromJSDate(game.lastPlayedDate), DateTime.DATE_MED)
								: "never",
						]),
				]),
		]);
}

function Group(title: string, games: SidebarGames, selectedGame: SidebarSelectedGame, searchParameters: URLSearchParams)
{
	return new DE("details",
		{
			class: "component-sidebar-group",

			open: true,
		},
		[
			new DE("summary", "title",
				[
					title,
					" (",
					Utilities.NumberLib.format(games.length),
					")",
				]),

			games.map((game) => Item(game, selectedGame, searchParameters)),
		]);
}

//
// Component
//

export type SidebarGameGroups = Map<string, SidebarGames>;

export type SidebarGames = SidebarGame[];

export type SidebarGame = Prisma.GameGetPayload<null>;

export type SidebarSelectedGame = Prisma.GameGetPayload<null> | null;

export function Sidebar(gameGroups: SidebarGameGroups, selectedGame: SidebarSelectedGame, searchParameters: URLSearchParams)
{
	return new DE("aside", "component-sidebar",
		[
			Array.from(gameGroups.entries()).map(([ title, games ]) => Group(title, games, selectedGame, searchParameters)),
		]);
}