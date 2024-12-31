//
// Imports
//

import { DE } from "@donutteam/document-builder";

import * as LibraryLib from "../../_shared/libs/Library.js";

import { Checkbox } from "./Checkbox.js";
import { Toolbar } from "./Toolbar.js";

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
					new DE("option",
						{
							value: "lastPlayed" satisfies LibraryLib.FilterOptions["groupMode"],
							selected: filterOptions.groupMode === "lastPlayed",
						},
						[
							"Group by Last played",
						]),
				]),

			new DE("select",
				{
					name: "sortMode",
				},
				[
					new DE("option",
						{
							value: "lastPlayed" satisfies LibraryLib.FilterOptions["sortMode"],
							selected: filterOptions.sortMode === "lastPlayed",
						},
						[
							"Sort by Last played",
						]),
				]),

			Checkbox("groupFavoritesSeparately", "Group favorites separately", filterOptions.groupFavoritesSeparately),

			Checkbox("showVisibleGames", "Show visible games", filterOptions.showVisibleGames),
			Checkbox("showHiddenGames", "Show hidden games", filterOptions.showHiddenGames),
			Checkbox("showNsfwGames", "Show NSFW games", filterOptions.showNsfwGames),
		]);
}