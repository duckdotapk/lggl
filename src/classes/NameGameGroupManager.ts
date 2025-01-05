//
// Imports
//

import { GameGroupManager } from "./GameGroupManager.js";

//
// Class
//

export class NameGameGroupManager extends GameGroupManager
{
	protected override groupGames()
	{
		const games = this.games.toSorted((a, b) => a.sortName.localeCompare(b.sortName));

		if (this.filterOptions.showFavoritesGroup)
		{
			this.addGamesToGroup("Favorites", games.filter((game) => game.isFavorite));
		}

		for (const game of games)
		{
			const firstLetter = game.sortName.charAt(0).toUpperCase();

			!isNaN(parseInt(firstLetter))
				? this.addGameToGroup("#", game)
				: this.addGameToGroup(firstLetter, game);
		}
	}
}