//
// Imports
//

import { Child } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { HumanDateTime } from "../components/basic/HumanDateTime.js";

import * as LibrarySchemaLib from "../libs/schemas/Library.js";

//
// Class
//

export type GameGroupManagerGame = Prisma.GameGetPayload<
	{
		include:
		{
			seriesGames:
			{
				include:
				{
					series: true;
				};
			};
		};
	}>;

export type GameGroupManagerGroup =
{
	name: string;
	entries: GameGroupManagerGroupEntry[];
};

export type GameGroupManagerGroupEntry =
{
	game: GameGroupManagerGame;
	details: Child;
};

export class GameGroupManager
{
	protected readonly filterOptions: LibrarySchemaLib.FilterOptions;

	protected readonly games: GameGroupManagerGame[] = [];

	protected readonly gameGroups: Map<string, GameGroupManagerGroup>;

	public constructor(filterOptions: LibrarySchemaLib.FilterOptions, games: GameGroupManagerGame[])
	{
		this.filterOptions = filterOptions;
		this.games = [ ...games ];

		this.gameGroups = new Map();

		this.groupGames();
	}

	protected getGroup(groupName: string): GameGroupManagerGroup
	{
		if (!this.gameGroups.has(groupName))
		{
			this.gameGroups.set(groupName, { name: groupName, entries: [] });
		}

		return this.gameGroups.get(groupName)!;
	}

	protected addGameToGroup(groupName: string | number, game: GameGroupManagerGame)
	{
		groupName = groupName.toString();

		const group = this.getGroup(groupName);

		group.entries.push(
			{
				game,
				details: this.getGameDetails(groupName, game),
			});
	}

	protected addGamesToGroup(groupName: string | number, games: GameGroupManagerGame[])
	{
		groupName = groupName.toString();

		for (const game of games)
		{
			this.addGameToGroup(groupName, game);
		}
	}

	protected getGameDetails(_groupName: string, game: GameGroupManagerGame): Child
	{
		return [
			"Last played ",
			game.lastPlayedDate != null
				? HumanDateTime(DateTime.fromJSDate(game.lastPlayedDate), DateTime.DATE_MED)
				: "never",
		];
	}

	protected groupGames()
	{
		for (const game of this.games)
		{
			this.addGameToGroup("All games", game);
		}
	}

	public getGroups()
	{
		return Array.from(this.gameGroups.values()).filter((group) => group.entries.length > 0);
	}
}