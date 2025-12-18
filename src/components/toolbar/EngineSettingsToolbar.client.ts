//
// Imports
//

import { getElementOrThrow, getInputEnumValue } from "@lorenstuff/browser-utilities";

import { initialiseForm } from "../../libs/client/Input.client.js";
import { defaultSelector, reloadView } from "../../libs/client/Pjax.client.js";

import { EngineGroupModeSchema } from "../../libs/models/Setting.schemas.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as schema from "../../routes/api/setting/update.schemas.js";

//
// Locals
//

async function initialise(toolbar: HTMLFormElement)
{
	const engineGroupModeSelect = getElementOrThrow<HTMLSelectElement>(
		toolbar,
		`select[name="engineGroupMode"]`,
	);

	toolbar.addEventListener("submit", (event) => event.preventDefault());

	initialiseForm(
	{
		form: toolbar,
		submitter: engineGroupModeSelect,
		requireConfirmation: false,
		onSubmit: async () => await apiRequest(
		{
			schema,
			requestBody:
			{
				settingUpdates:
				[
					{
						name: "ENGINE_GROUP_MODE",
						value: getInputEnumValue(engineGroupModeSelect, EngineGroupModeSchema),
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

export async function initialiseEngineSettingsToolbars()
{
	const toolbars = document.querySelectorAll<HTMLFormElement>(
		".component-engine-settings-toolbar:not(.initialised)",
	);

	for (const toolbar of toolbars)
	{
		initialise(toolbar)
			.then(() => console.log("[EngineSettingsToolbar] Initialised:", toolbar))
			.catch((error) =>
				console.error("[EngineSettingsToolbar] Error initialising:", toolbar, error));
	}
}