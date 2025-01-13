//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";
import * as PjaxClientLib from "../../libs/client/Pjax.client.js";

import * as SettingSchemaLib from "../../libs/schemas/Setting.js";

import { updateSettings } from "../../routes/api/setting/update.schemas.js";

//
// Locals
//

async function initialise(toolbar: HTMLFormElement)
{
	const engineGroupModeSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(toolbar, `select[name="engineGroupMode"]`);

	toolbar.addEventListener("submit", (event) => event.preventDefault());

	InputClientLib.initialiseForm(
		{
			form: toolbar,
			submitter: engineGroupModeSelect,
			requireConfirmation: false,
			onSubmit: async () => await updateSettings(
				{
					settingUpdates:
					[
						{
							name: "engineGroupMode",
							value: engineGroupModeSelect.value as SettingSchemaLib.EngineGroupMode,
						},
					],
				}),
			onSuccess: async () => PjaxClientLib.reloadView(PjaxClientLib.defaultSelector),
		});
}

//
// Components
//

export async function initialiseEngineSettingsToolbars()
{
	const toolbars = document.querySelectorAll<HTMLFormElement>(".component-engine-settings-toolbar:not(.initialised)");

	for (const toolbar of toolbars)
	{
		try
		{
			await initialise(toolbar);
			
			toolbar.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[EngineSettingsToolbar] Error initialising:", toolbar, error);
		}
	}
}