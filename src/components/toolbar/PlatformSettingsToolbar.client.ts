//
// Imports
//

import { getElementOrThrow, getInputEnumValue } from "@lorenstuff/browser-utilities";

import { initialiseForm } from "../../libs/client/Input.client.js";
import { defaultSelector, reloadView } from "../../libs/client/Pjax.client.js";

import { PlatformGroupModeSchema } from "../../libs/models/Setting.schemas.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as schema from "../../routes/api/setting/update.schemas.js";

//
// Locals
//

async function initialise(toolbar: HTMLFormElement)
{
	const platformGroupModeSelect = getElementOrThrow<HTMLSelectElement>(
		toolbar,
		`select[name="platformGroupMode"]`,
	);

	toolbar.addEventListener("submit", (event) => event.preventDefault());

	initialiseForm(
	{
		form: toolbar,
		submitter: platformGroupModeSelect,
		requireConfirmation: false,
		onSubmit: async () => await apiRequest(
		{
			schema,
			requestBody:
			{
				settingUpdates:
				[
					{
						name: "PLATFORM_GROUP_MODE",
						value: getInputEnumValue(platformGroupModeSelect, PlatformGroupModeSchema),
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

export async function initialisePlatformSettingsToolbars()
{
	const toolbars = document.querySelectorAll<HTMLFormElement>(
		".component-platform-settings-toolbar:not(.initialised)"
	);

	for (const toolbar of toolbars)
	{
		initialise(toolbar)
			.then(() => console.log("[PlatformSettingsToolbar] Initialised:", toolbar))
			.catch((error) =>
				console.error("[PlatformSettingsToolbar] Error initialising:", toolbar, error));
	}
}