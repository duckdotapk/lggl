//
// Imports
//

import { DE } from "@donutteam/document-builder";

import * as LibraryLib from "../../_shared/libs/Library.js";

import { Checkbox } from "./Checkbox.js";
import { Toolbar } from "./Toolbar.js";

//
// Locals
//

function Option(value: LibraryLib.FilterOptions["groupMode"], label: string, selected: boolean)
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

export function FilterOptionsToolbar(filterOptions: LibraryLib.FilterOptions)
{
	return Toolbar("component-filter-options-toolbar", null,
		[
			new DE("select",
				{
					name: "groupMode",
				},
				[
					Option("name", "Group by Name", filterOptions.groupMode === "name"),

					Option("lastPlayed", "Group by Last played", filterOptions.groupMode === "lastPlayed"),

					Option("series", "Group by Series", filterOptions.groupMode === "series"),
				]),

			Checkbox("showFavoritesGroup", "Show favorites group", filterOptions.showFavoritesGroup),

			Checkbox("showVisibleGames", "Show visible games", filterOptions.showVisibleGames),
			Checkbox("showHiddenGames", "Show hidden games", filterOptions.showHiddenGames),
			Checkbox("showNsfwGames", "Show NSFW games", filterOptions.showNsfwGames),
		]);
}