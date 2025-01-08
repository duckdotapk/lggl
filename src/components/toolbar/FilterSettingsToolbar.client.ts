//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as SettingSchemaLib from "../../libs/schemas/Setting.js";

import { updateSettings } from "../../routes/api/setting/update.schemas.js";

//
// Locals
//

async function initialise(toolbar: HTMLFormElement)
{
	const groupModeSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(toolbar, `select[name="groupMode"]`);

	const showFavoritesGroupCheckbox = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, `input[name="showFavoritesGroup"]`);

	const showVisibleGamesCheckbox = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, `input[name="showVisibleGames"]`);

	const showHiddenGamesCheckbox = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, `input[name="showHiddenGames"]`);

	const showNsfwGamesCheckbox = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, `input[name="showNsfwGames"]`);

	toolbar.addEventListener("submit", (event) => event.preventDefault());

	groupModeSelect.addEventListener("change",
		async () =>
		{
			await updateSettings(
				{
					settingUpdates:
					[
						{
							name: "groupMode",
							value: groupModeSelect.value as SettingSchemaLib.GroupMode,
						},
					],
				});

			// TODO: somehow make this not require a reload
			window.location.reload();
		});

	showFavoritesGroupCheckbox.addEventListener("change",
		async () =>
		{
			const _ = await updateSettings(
				{
					settingUpdates:
					[
						{
							name: "showFavoritesGroup",
							value: showFavoritesGroupCheckbox.checked,
						},
					],
				});

			console.log(_);

			// TODO: somehow make this not require a reload
			window.location.reload();
		});

	showVisibleGamesCheckbox.addEventListener("change",
		async () =>
		{
			await updateSettings(
				{
					settingUpdates:
					[
						{
							name: "showVisibleGames",
							value: showVisibleGamesCheckbox.checked,
						},
					],
				});

			// TODO: somehow make this not require a reload
			window.location.reload();
		});

	showHiddenGamesCheckbox.addEventListener("change",
		async () =>
		{
			await updateSettings(
				{
					settingUpdates:
					[
						{
							name: "showHiddenGames",
							value: showHiddenGamesCheckbox.checked,
						},
					],
				});

			// TODO: somehow make this not require a reload
			window.location.reload();
		});

	showNsfwGamesCheckbox.addEventListener("change",
		async () =>
		{
			await updateSettings(
				{
					settingUpdates:
					[
						{
							name: "showNsfwGames",
							value: showNsfwGamesCheckbox.checked,
						},
					],
				});

			// TODO: somehow make this not require a reload
			window.location.reload();
		});
}

//
// Components
//

export async function initialiseFilterOptionsToolbars()
{
	const toolbars = document.querySelectorAll<HTMLFormElement>(".component-filter-settings-toolbar:not(.initialised)");

	console.log("[FilterOptionsToolbar]", toolbars);

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