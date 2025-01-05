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
	override getGameDetails(groupName: string, game: GameGroupManagerGame)
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