//
// Imports
//

import { Checkbox } from "../input/Checkbox.js";
import { Control } from "../input/Control.js";

import { Toolbar } from "./Toolbar.js";

import * as SettingModelLib from "../../libs/models/Setting.js";

import * as SettingSchemaLib from "../../libs/schemas/Setting.js";

//
// Components
//

export function GameSettingsToolbar(settings: SettingModelLib.Settings)
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
					options: SettingSchemaLib.GameGroupModeSchema.options.map(
						(gameGroupMode) => 
						({ 
							value: gameGroupMode, 
							label: "Group by " + SettingModelLib.getGameGroupModeName(gameGroupMode),
						})),
				}),

			Checkbox("showFavoritesGroup", "Show favorites group", settings.showFavoritesGroup),

			Checkbox("showRegularGames", "Show regular games", settings.showRegularGames),

			Checkbox("showHiddenGames", "Show hidden games", settings.showHiddenGames),

			Checkbox("showNsfwGames", "Show NSFW games", settings.showNsfwGames),
		]);
}