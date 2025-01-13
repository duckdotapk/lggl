//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";

import * as SettingSchemaLib from "../../libs/schemas/Setting.js";

import { updateSettings } from "../../routes/api/setting/update.schemas.js";

//
// Locals
//

async function initialise(toolbar: HTMLFormElement)
{
	const gameGroupModeSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(toolbar, `select[name="gameGroupMode"]`);

	const showFavoritesGroupCheckbox = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, `input[name="showFavoritesGroup"]`);

	const showVisibleGamesCheckbox = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, `input[name="showVisibleGames"]`);

	const showHiddenGamesCheckbox = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, `input[name="showHiddenGames"]`);

	const showNsfwGamesCheckbox = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, `input[name="showNsfwGames"]`);

	toolbar.addEventListener("submit", (event) => event.preventDefault());

	InputClientLib.initialiseForm(
		{
			form: toolbar,
			submitter: gameGroupModeSelect,
			requireConfirmation: false,
			onSubmit: async () => await updateSettings(
				{
					settingUpdates:
					[
						{
							name: "gameGroupMode",
							value: gameGroupModeSelect.value as SettingSchemaLib.GameGroupMode,
						},
					],
				}),
			onSuccess: async () => window.location.reload(),
		});

	InputClientLib.initialiseForm(
		{
			form: toolbar,
			submitter: showFavoritesGroupCheckbox,
			requireConfirmation: false,
			onSubmit: async () => await updateSettings(
				{
					settingUpdates:
					[
						{
							name: "showFavoritesGroup",
							value: showFavoritesGroupCheckbox.checked,
						},
					],
				}),
			onSuccess: async () => window.location.reload(),
		});

	InputClientLib.initialiseForm(
		{
			form: toolbar,
			submitter: showVisibleGamesCheckbox,
			requireConfirmation: false,
			onSubmit: async () => await updateSettings(
				{
					settingUpdates:
					[
						{
							name: "showVisibleGames",
							value: showVisibleGamesCheckbox.checked,
						},
					],
				}),
			onSuccess: async () => window.location.reload(),
		});

	InputClientLib.initialiseForm(
		{
			form: toolbar,
			submitter: showHiddenGamesCheckbox,
			requireConfirmation: false,
			onSubmit: async () => await updateSettings(
				{
					settingUpdates:
					[
						{
							name: "showHiddenGames",
							value: showHiddenGamesCheckbox.checked,
						},
					],
				}),
			onSuccess: async () => window.location.reload(),
		});

	InputClientLib.initialiseForm(
		{
			form: toolbar,
			submitter: showNsfwGamesCheckbox,
			requireConfirmation: false,
			onSubmit: async () => await updateSettings(
				{
					settingUpdates:
					[
						{
							name: "showNsfwGames",
							value: showNsfwGamesCheckbox.checked,
						},
					],
				}),
			onSuccess: async () => window.location.reload(),
		});
}

//
// Components
//

export async function initialiseGameSettingsToolbars()
{
	const toolbars = document.querySelectorAll<HTMLFormElement>(".component-game-settings-toolbar:not(.initialised)");

	console.log("[GameSettingsToolbar]", toolbars);

	for (const toolbar of toolbars)
	{
		try
		{
			await initialise(toolbar);
			
			toolbar.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[GameSettingsToolbar] Error initialising:", toolbar, error);
		}
	}
}