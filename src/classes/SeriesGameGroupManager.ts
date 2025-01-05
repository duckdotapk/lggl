//
// Imports
//

import { GameGroupManager, GameGroupManagerGame } from "./GameGroupManager.js";

//
// Class
//

export class SeriesGameGroupManager extends GameGroupManager
{
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

		const seriesGame = game.seriesGames.find((seriesGame) => seriesGame.series.name == groupName)!;

		return [
			"Game #" + seriesGame.number,
			" · ",
			super.getGameDetails(groupName, game),
		];
	}
}