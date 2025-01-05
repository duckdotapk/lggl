//
// Imports
//

import { Prisma } from "@prisma/client";

import { GameGroupManager, GameGroupManagerGame } from "./GameGroupManager.js";

//
// Class
//

export class SeriesGameGroupManager extends GameGroupManager
{
	protected override groupGames()
	{
		const seriesWithGamesBySeriesName: Map<string, 
			{ 
				series: Prisma.SeriesGetPayload<null>, 
				games: GameGroupManagerGame[],
			}> = new Map();

		const games = [ ...this.games ];

		for (const game of games)
		{
			if (game.seriesGames.length === 0)
			{
				continue;
			}

			for (const seriesGame of game.seriesGames)
			{
				const seriesWithGames = seriesWithGamesBySeriesName.get(seriesGame.series.name) ??
				{
					series: seriesGame.series,
					games: [],
				};

				seriesWithGames.games.push(game);

				seriesWithGamesBySeriesName.set(seriesGame.series.name, seriesWithGames);
			}
		}

		for (const [ seriesName, seriesWithGames ] of seriesWithGamesBySeriesName.entries())
		{
			seriesWithGamesBySeriesName.set(seriesName,
				{
					series: seriesWithGames.series,
					games: seriesWithGames.games.sort(
						(a, b) =>
						{
							const seriesGameA = a.seriesGames.find((seriesGame) => seriesGame.series_id = seriesWithGames.series.id)!;

							const seriesGameB = b.seriesGames.find((seriesGame) => seriesGame.series_id = seriesWithGames.series.id)!;

							if (seriesGameA.number < seriesGameB.number)
							{
								return -1;
							}

							if (seriesGameA.number > seriesGameB.number)
							{
								return 1;
							}

							// TODO: sort games by release date after number!

							return a.sortName.localeCompare(b.sortName);
						}),
				});
		}

		const gamesWithoutSeries = games
			.filter((game) => game.seriesGames.length == 0)
			.sort((a, b) => a.sortName.localeCompare(b.sortName));

		if (this.filterOptions.showFavoritesGroup)
		{
			for (const seriesWithGames of Array.from(seriesWithGamesBySeriesName.values()).sort((a, b) => a.series.name.localeCompare(b.series.name)))
			{
				const favoriteGames = seriesWithGames.games.filter((game) => game.isFavorite);

				this.addGamesToGroup("Favorites: " + seriesWithGames.series.name, favoriteGames);
			}

			const favoriteGamesWithoutSeries = gamesWithoutSeries.filter((game) => game.isFavorite);

			this.addGamesToGroup("Favorites: -", favoriteGamesWithoutSeries);
		}

		for (const seriesWithGames of Array.from(seriesWithGamesBySeriesName.values()).sort((a, b) => a.series.name.localeCompare(b.series.name)))
		{
			this.addGamesToGroup(seriesWithGames.series.name, seriesWithGames.games);
		}

		if (gamesWithoutSeries.length > 0)
		{
			this.addGamesToGroup("-", gamesWithoutSeries);
		}
	}

	override getGameDetails(groupName: string, game: GameGroupManagerGame)
	{
		if (game.seriesGames.length == 0)
		{
			return [
				"No series",
				" · ",
				super.getGameDetails(groupName, game),
			];
		}

		if (groupName.startsWith("Favorites: "))
		{
			groupName = groupName.substring("Favorites: ".length);
		}

		const seriesGame = game.seriesGames.find((seriesGame) => seriesGame.series.name == groupName)!;

		return [
			"Series game #" + seriesGame.number,
			" · ",
			super.getGameDetails(groupName, game),
		];
	}
}