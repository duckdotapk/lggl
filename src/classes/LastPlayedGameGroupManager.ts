//
// Imports
//

import { GameGroupManager } from "./GameGroupManager.js";

//
// Class
//

export class LastPlayedGameGroupManager extends GameGroupManager
{
	protected override groupGames()
	{
		const games = this.games.toSorted((a, b) => (b.lastPlayedDate ?? new Date(0)).getTime() - (a.lastPlayedDate ?? new Date(0)).getTime());

		if (this.filterOptions.showFavoritesGroup)
		{
			this.addGamesToGroup("Favorites", games.filter((game) => game.isFavorite));
		}

		const playedGames = games.filter((game) => game.lastPlayedDate != null && game.playTimeTotalSeconds > 0);

		for (const playedGame of playedGames)
		{
			this.addGameToGroup(playedGame.lastPlayedDate!.getFullYear(), playedGame);
		}

		const unplayedGames = games
			.filter((game) => game.lastPlayedDate == null || game.playTimeTotalSeconds == 0)
			.sort((a, b) => a.sortName.localeCompare(b.sortName));

		this.addGamesToGroup("Unplayed", unplayedGames);
	}
}