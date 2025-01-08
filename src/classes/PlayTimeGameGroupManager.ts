//
// Imports
//

import { GameGroupManager, GameGroupManagerGame } from "./GameGroupManager.js";

import { shortEnglishHumanizer } from "../instances/humanizer.js";

//
// Class
//

export class PlayTimeGameGroupManager extends GameGroupManager
{
	protected override groupGames()
	{
		const games = this.games.toSorted((a, b) => b.playTimeTotalSeconds - a.playTimeTotalSeconds);

		if (this.settings.showFavoritesGroup)
		{
			this.addGamesToGroup("Favorites", games.filter((game) => game.isFavorite));
		}

		const playedGames = games.filter((game) => game.playTimeTotalSeconds > 0);

		if (playedGames.length > 0)
		{
			for (const playedGame of playedGames)
			{
				const playTimeTotalHours = Math.floor(playedGame.playTimeTotalSeconds / 3600);

				if (playTimeTotalHours >= 1000)
				{
					this.addGameToGroup("Over 1000 hours", playedGame);
				}
				else if (playTimeTotalHours >= 750)
				{
					this.addGameToGroup("Over 750 hours", playedGame);
				}
				else if (playTimeTotalHours >= 500)
				{
					this.addGameToGroup("Over 500 hours", playedGame);
				}
				else if (playTimeTotalHours >= 250)
				{
					this.addGameToGroup("Over 250 hours", playedGame);
				}
				else if (playTimeTotalHours >= 100)
				{
					this.addGameToGroup("Over 100 hours", playedGame);
				}
				else if (playTimeTotalHours >= 50)
				{
					this.addGameToGroup("Over 50 hours", playedGame);
				}
				else if (playTimeTotalHours >= 10)
				{
					this.addGameToGroup("Over 10 hours", playedGame);
				}
				else if (playTimeTotalHours >= 5)
				{
					this.addGameToGroup("Over 5 hours", playedGame);
				}
				else if (playTimeTotalHours >= 4)
				{
					this.addGameToGroup("Over 4 hours", playedGame);
				}
				else if (playTimeTotalHours >= 3)
				{
					this.addGameToGroup("Over 3 hours", playedGame);
				}
				else if (playTimeTotalHours >= 2)
				{
					this.addGameToGroup("Over 2 hours", playedGame);
				}
				else if (playTimeTotalHours >= 1)
				{
					this.addGameToGroup("Over 1 hour", playedGame);
				}
				else
				{
					this.addGameToGroup("Under 1 hour", playedGame);
				}
			}
		}

		const unplayedGames = games
			.filter((game) => game.playTimeTotalSeconds == 0)
			.sort((a, b) => a.sortName.localeCompare(b.sortName));

		this.addGamesToGroup("No play time", unplayedGames);
	}

	protected override getGameDetails(groupName: string, game: GameGroupManagerGame)
	{
		if (game.playTimeTotalSeconds == 0)
		{
			return [
				"Never played",
				" · ",
				super.getGameDetails(groupName, game),
			];
		}

		return [
			"Played ",
			shortEnglishHumanizer(game.playTimeTotalSeconds * 1000),
			" · ",
			super.getGameDetails(groupName, game),
		];
	}
}