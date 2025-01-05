//
// Imports
//

import { DE } from "@donutteam/document-builder";
import * as Utilities from "@donutteam/utilities";
import { Prisma } from "@prisma/client";

import { GameGroupManager, GameGroupManagerGroup, GameGroupManagerGroupEntry } from "../classes/GameGroupManager.js";

import { Muted } from "./inline/Muted.js";

import { staticMiddleware } from "../instances/server.js";

import * as GameModelLib from "../libs/models/Game.js";

//
// Locals
//

function Item(groupGame: GameGroupManagerGroupEntry, selectedGame: SidebarSelectedGame, searchParameters: URLSearchParams)
{
	let className = "component-sidebar-group-item";

	if (selectedGame != null && groupGame.game.id == selectedGame.id)
	{
		className += " selected";
	}

	const itemSearchParameters = new URLSearchParams(searchParameters);

	itemSearchParameters.set("selectedGameId", groupGame.game.id.toString());

	const imageUrls = GameModelLib.getImageUrls(groupGame.game);

	return new DE("a",
		{
			class: className,

			href: "/?" + itemSearchParameters.toString(),

			"data-name": groupGame.game.name,
			"data-normalized-name": groupGame.game.name.toLowerCase().replace(/[^a-z0-9]/g, " "), // TODO: move this to GameModelLib utility function

			"data-is-installed": groupGame.game.isInstalled,
		},
		[
			new DE("div", "icon-wrapper",
				[
					groupGame.game.hasIconImage
						? new DE("img",
							{
								class: "icon image",
								src: staticMiddleware.getCacheBustedPath(imageUrls.icon),
								alt: groupGame.game.name + " icon",
							})
						: new DE("div", "icon font-awesome",
							[
								new DE("span", "fa-solid fa-gamepad-modern fa-fw"),
							]),
				]),

			new DE("div", "text-wrapper",
				[
					new DE("div", "name", groupGame.game.name),

					new DE("div", "details", Muted(groupGame.details)),
				]),
		]);
}

function Group(group: GameGroupManagerGroup, selectedGame: SidebarSelectedGame, searchParameters: URLSearchParams)
{
	return new DE("details",
		{
			class: "component-sidebar-group",

			"data-name": group.title,
		},
		[
			new DE("summary", "title",
				[
					group.title,
					" (",
					Utilities.NumberLib.format(group.games.length),
					")",
				]),

			group.games.map((groupGame) => Item(groupGame, selectedGame, searchParameters)),
		]);
}

function Search()
{
	return new DE("input",
		{
			class: "component-sidebar-search",
			name: "search",
			placeholder: "Search for a game...",
		});
}

//
// Component
//

export type SidebarSelectedGame = Prisma.GameGetPayload<null> | null;

export function Sidebar(gameGroupManager: GameGroupManager, selectedGame: SidebarSelectedGame, searchParameters: URLSearchParams)
{
	return new DE("aside", "component-sidebar",
		[
			Search(),

			gameGroupManager.getGroups().map((group) => Group(group, selectedGame, searchParameters)),
		]);
}