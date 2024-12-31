//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import type * as LibraryLib from "../../_shared/libs/Library.js";

//
// Locals
//

async function initialise(toolbar: HTMLFormElement)
{
	const groupModeSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(toolbar, `select[name="groupMode"]`);

	const sortModeSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(toolbar, `select[name="sortMode"]`);

	const groupFavoritesSeparatelyCheckbox = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, `input[name="groupFavoritesSeparately"]`);

	const showVisibleGamesCheckbox = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, `input[name="showVisibleGames"]`);

	const showHiddenGamesCheckbox = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, `input[name="showHiddenGames"]`);

	const showNsfwGamesCheckbox = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, `input[name="showNsfwGames"]`);

	const updateFilterOptions = () =>
	{
		const filterOptions: LibraryLib.FilterOptions =
		{
			groupMode: groupModeSelect.value as LibraryLib.FilterOptions["groupMode"],
			sortMode: sortModeSelect.value as LibraryLib.FilterOptions["sortMode"],
	
			groupFavoritesSeparately: groupFavoritesSeparatelyCheckbox.checked,
	
			showVisibleGames: showVisibleGamesCheckbox.checked,
			showHiddenGames: showHiddenGamesCheckbox.checked,
			showNsfwGames: showNsfwGamesCheckbox.checked,
		};
	
		const searchParameters = new URLSearchParams(window.location.search);
	
		searchParameters.set("filterOptions", JSON.stringify(filterOptions));
	
		window.location.search = searchParameters.toString();
	};

	toolbar.addEventListener("submit", () => updateFilterOptions());

	toolbar.addEventListener("change", () => updateFilterOptions());

	// groupModeSelect.addEventListener("change", () => updateFilterOptions());
	// sortModeSelect.addEventListener("change", () => updateFilterOptions());

	// groupFavoritesSeparatelyCheckbox.addEventListener("change", () => updateFilterOptions());

	// showVisibleGamesCheckbox.addEventListener("change", () => updateFilterOptions());
	// showHiddenGamesCheckbox.addEventListener("change", () => updateFilterOptions());
	// showNsfwGamesCheckbox.addEventListener("change", () => updateFilterOptions());
}

//
// Components
//

export async function initialiseFilterOptionsToolbars()
{
	const toolbars = document.querySelectorAll<HTMLFormElement>(".component-filter-options-toolbar:not(.initialised)");

	for (const toolbar of toolbars)
	{
		try
		{
			await initialise(toolbar);
			
			toolbar.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[FilterOptionsToolbar] Error initialising:", toolbar, error);
		}
	}
}