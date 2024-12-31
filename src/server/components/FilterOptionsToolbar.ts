//
// Imports
//

import { DE } from "@donutteam/document-builder";

import * as LibraryLib from "../../_shared/libs/Library.js";

//
// Locals
//

function Checkbox(name: string, label: string, checked: boolean)
{
	return new DE("label", "component-filter-options-toolbar-checkbox",
		[
			new DE("input",
				{
					type: "checkbox",
					name: name,
					checked,
				}),
			
			new DE("span", "label",
				[
					label,
				]),
		]);
}

//
// Components
//

export function FilterOptionsToolbar(filterOptions: LibraryLib.FilterOptions)
{
	return new DE("form", "component-filter-options-toolbar",
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