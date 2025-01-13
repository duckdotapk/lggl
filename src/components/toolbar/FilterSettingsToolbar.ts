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

export function FilterSettingsToolbar(settings: SettingModelLib.Settings)
{
	return Toolbar("component-filter-settings-toolbar", null,
		[
			Control(
				{
					type: "select",
					name: "groupMode",
					value: settings.groupMode,
					required: true,
					options:
					[
						{ value: "name" satisfies SettingSchemaLib.GroupMode, label: "Group by Name" },
						{ value: "lastPlayed" satisfies SettingSchemaLib.GroupMode, label: "Group by Last played" },
						{ value: "series" satisfies SettingSchemaLib.GroupMode, label: "Group by Series" },
						{ value: "playTime" satisfies SettingSchemaLib.GroupMode, label: "Group by Play time" },
					],
				}),

			Checkbox("showFavoritesGroup", "Show favorites group", settings.showFavoritesGroup),

			Checkbox("showVisibleGames", "Show visible games", settings.showVisibleGames),

			Checkbox("showHiddenGames", "Show hidden games", settings.showHiddenGames),

			Checkbox("showNsfwGames", "Show NSFW games", settings.showNsfwGames),
		]);
}