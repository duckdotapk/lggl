//
// Imports
//

import { Checkbox } from "../input/Checkbox.js";
import { Control } from "../input/Control.js";

import { Toolbar } from "./Toolbar.js";

import { getGameGroupModeName, Settings } from "../../libs/models/Setting.js";
import { GameGroupModeSchema } from "../../libs/models/Setting.schemas.js";

//
// Components
//

export function GameSettingsToolbar(settings: Settings)
{
	return Toolbar("component-game-settings-toolbar", null,
	[
		Control(
		{
			type: "select",
			name: "gameGroupMode",
			value: settings.gameGroupMode,
			required: true,
			showEmptyOption: false,
			options: GameGroupModeSchema.options.map((gameGroupMode) => 
			({ 
				value: gameGroupMode, 
				label: "Group by " + getGameGroupModeName(gameGroupMode),
			})),
		}),

		Checkbox("showFavoritesGroup", "Show favorites group", settings.showFavoritesGroup),

		Checkbox("showRegularGames", "Show regular games", settings.showRegularGames),

		Checkbox("showHiddenGames", "Show hidden games", settings.showHiddenGames),

		Checkbox("showNsfwGames", "Show NSFW games", settings.showNsfwGames),
	]);
}