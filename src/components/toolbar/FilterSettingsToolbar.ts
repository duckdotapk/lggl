//
// Imports
//

import { DE } from "@donutteam/document-builder";

import { Checkbox } from "../input/Checkbox.js";

import { Toolbar } from "./Toolbar.js";

import * as SettingModelLib from "../../libs/models/Setting.js";

import * as SettingSchemaLib from "../../libs/schemas/Setting.js";

//
// Locals
//

function Option(value: SettingSchemaLib.GroupMode, label: string, selected: boolean)
{
	return new DE("option",
		{
			value: value,
			selected: selected,
		},
		[
			label,
		]);
}

//
// Components
//

export function FilterSettingsToolbar(settings: SettingModelLib.Settings)
{
	return Toolbar("component-filter-settings-toolbar", null,
		[
			new DE("select",
				{
					name: "groupMode",
				},
				[
					Option("name", "Group by Name", settings.groupMode === "name"),

					Option("lastPlayed", "Group by Last played", settings.groupMode === "lastPlayed"),

					Option("series", "Group by Series", settings.groupMode === "series"),

					Option("playTime", "Group by Play time", settings.groupMode === "playTime"),
				]),

			Checkbox("showFavoritesGroup", "Show favorites group", settings.showFavoritesGroup),

			Checkbox("showVisibleGames", "Show visible games", settings.showVisibleGames),
			Checkbox("showHiddenGames", "Show hidden games", settings.showHiddenGames),
			Checkbox("showNsfwGames", "Show NSFW games", settings.showNsfwGames),
		]);
}