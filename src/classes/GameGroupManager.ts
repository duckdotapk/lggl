//
// Imports
//

import { Child } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { HumanDateTime } from "../components/inline/HumanDateTime.js";

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
	title: string;
	games: GameGroupManagerGroupEntry[];
};

export type GameGroupManagerGroupEntry =
{
	game: GameGroupManagerGame;
	details: Child;
};

export class GameGroupManager
{
	#gameGroups: Map<string, GameGroupManagerGroup> = new Map();

	addGame(groupName: string | number, game: GameGroupManagerGame)
	{
		groupName = groupName.toString();

		const gameGroup = this.#gameGroups.get(groupName) ?? { title: groupName, games: [] };

		gameGroup.games.push(
			{
				game,
				details: this.getGameDetails(groupName, game),
			});

		this.#gameGroups.set(groupName, gameGroup);

		return this;
	}

	addGames(groupName: string | number, games: GameGroupManagerGame[])
	{
		groupName = groupName.toString();

		const gameGroup = this.#gameGroups.get(groupName) ?? { title: groupName, games: [] };

		for (const game of games)
		{
			gameGroup.games.push(
				{
					game,
					details: this.getGameDetails(groupName, game),
				});
		}

		this.#gameGroups.set(groupName, gameGroup);

		return this;
	}

	getGameDetails(_groupName: string, game: GameGroupManagerGame): Child
	{
		return [
			"Last played ",
			game.lastPlayedDate != null
				? HumanDateTime(DateTime.fromJSDate(game.lastPlayedDate), DateTime.DATE_MED)
				: "never",
		];
	}

	getGroups()
	{
		return Array.from(this.#gameGroups.values()).filter((gameGroup) => gameGroup.games.length > 0);
	}
}