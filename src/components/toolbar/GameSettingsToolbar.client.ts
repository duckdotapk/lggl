//
// Imports
//

import { getElementOrThrow, getInputEnumValue } from "@lorenstuff/browser-utilities";

import { initialiseForm } from "../../libs/client/Input.client.js";
import { defaultSelector, reloadView } from "../../libs/client/Pjax.client.js";

import { GameGroupModeSchema } from "../../libs/models/Setting.schemas.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as schema from "../../routes/api/setting/update.schemas.js";

//
// Locals
//

async function initialise(toolbar: HTMLFormElement)
{
	const gameGroupModeSelect = getElementOrThrow<HTMLSelectElement>(
		toolbar,
		`select[name="gameGroupMode"]`,
	);
	const showFavoritesGroupCheckbox = getElementOrThrow<HTMLInputElement>(
		toolbar,
		`input[name="showFavoritesGroup"]`,
	);
	const showRegularGamesCheckbox = getElementOrThrow<HTMLInputElement>(
		toolbar,
		`input[name="showRegularGames"]`,
	);
	const showHiddenGamesCheckbox = getElementOrThrow<HTMLInputElement>(
		toolbar,
		`input[name="showHiddenGames"]`,
	);
	const showNsfwGamesCheckbox = getElementOrThrow<HTMLInputElement>(
		toolbar,
		`input[name="showNsfwGames"]`,
	);

	toolbar.addEventListener("submit", (event) => event.preventDefault());

	initialiseForm(
	{
		form: toolbar,
		submitter: gameGroupModeSelect,
		requireConfirmation: false,
		onSubmit: async () => await apiRequest(
		{
			schema,
			requestBody:
			{
				settingUpdates:
				[
					{
						name: "GAME_GROUP_MODE",
						value: getInputEnumValue(gameGroupModeSelect, GameGroupModeSchema),
					},
				],
			},
		}).getResponse(),
		onSuccess: async () => reloadView(defaultSelector),
	});

	initialiseForm(
	{
		form: toolbar,
		submitter: showFavoritesGroupCheckbox,
		requireConfirmation: false,
		onSubmit: async () => await apiRequest(
		{
			schema,
			requestBody:
			{
				settingUpdates:
				[
					{
						name: "SHOW_FAVORITES_GROUP",
						value: showFavoritesGroupCheckbox.checked,
					},
				],
			},
		}).getResponse(),
		onSuccess: async () => reloadView(defaultSelector),
	});

	initialiseForm(
	{
		form: toolbar,
		submitter: showRegularGamesCheckbox,
		requireConfirmation: false,
		onSubmit: async () => await apiRequest(
		{
			schema,
			requestBody:
			{
				settingUpdates:
				[
					{
						name: "SHOW_REGULAR_GAMES",
						value: showRegularGamesCheckbox.checked,
					},
				],
			},
		}).getResponse(),
		onSuccess: async () => reloadView(defaultSelector),
	});

	initialiseForm(
	{
		form: toolbar,
		submitter: showHiddenGamesCheckbox,
		requireConfirmation: false,
		onSubmit: async () => await apiRequest(
		{
			schema,
			requestBody:
			{
				settingUpdates:
				[
					{
						name: "SHOW_HIDDEN_GAMES",
						value: showHiddenGamesCheckbox.checked,
					},
				],
			},
		}).getResponse(),
		onSuccess: async () => reloadView(defaultSelector),
	});

	initialiseForm(
	{
		form: toolbar,
		submitter: showNsfwGamesCheckbox,
		requireConfirmation: false,
		onSubmit: async () => await apiRequest(
		{
			schema,
			requestBody:
			{
				settingUpdates:
				[
					{
						name: "SHOW_NSFW_GAMES",
						value: showNsfwGamesCheckbox.checked
					},
				],
			},
		}).getResponse(),
		onSuccess: async () => reloadView(defaultSelector),
	});

	toolbar.classList.add("initialised");
}

//
// Components
//

export async function initialiseGameSettingsToolbars()
{
	const toolbars = document.querySelectorAll<HTMLFormElement>(
		".component-game-settings-toolbar:not(.initialised)",
	);

	for (const toolbar of toolbars)
	{
		initialise(toolbar)
			.then(() => console.log("[GameSettingsToolbar] Initialised:", toolbar))
			.catch((error) =>
				console.error("[GameSettingsToolbar] Error initialising:", toolbar, error));
	}
}