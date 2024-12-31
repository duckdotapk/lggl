//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import type * as LibraryLib from "../../_shared/libs/Library.js";

//
// Locals
//

async function initialise(element: HTMLFormElement)
{
	const groupModeSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(element, `select[name="groupMode"]`);

	const sortModeSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(element, `select[name="sortMode"]`);

	const groupFavoritesSeparatelyCheckbox = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(element, `input[name="groupFavoritesSeparately"]`);

	const showVisibleGamesCheckbox = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(element, `input[name="showVisibleGames"]`);

	const showHiddenGamesCheckbox = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(element, `input[name="showHiddenGames"]`);

	const showNsfwGamesCheckbox = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(element, `input[name="showNsfwGames"]`);

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

	element.addEventListener("submit", () => updateFilterOptions());

	element.addEventListener("change", () => updateFilterOptions());

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
	const filterOptionsToolbars = document.querySelectorAll<HTMLFormElement>(".component-filter-options-toolbar:not(.initialised)");

	for (const element of filterOptionsToolbars)
	{
		try
		{
			await initialise(element);
			
			element.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[FilterOptionsToolbar] Error initialising:", element, error);
		}
	}
}