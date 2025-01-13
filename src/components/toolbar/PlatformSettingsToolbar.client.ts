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
	const platformGroupModeSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(toolbar, `select[name="platformGroupMode"]`);

	toolbar.addEventListener("submit", (event) => event.preventDefault());

	InputClientLib.initialiseForm(
		{
			form: toolbar,
			submitter: platformGroupModeSelect,
			requireConfirmation: false,
			onSubmit: async () => await updateSettings(
				{
					settingUpdates:
					[
						{
							name: "platformGroupMode",
							value: platformGroupModeSelect.value as SettingSchemaLib.PlatformGroupMode,
						},
					],
				}),
			onSuccess: async () => window.location.reload(),
		});
}

//
// Components
//

export async function initialisePlatformSettingsToolbars()
{
	const toolbars = document.querySelectorAll<HTMLFormElement>(".component-platform-settings-toolbar:not(.initialised)");

	for (const toolbar of toolbars)
	{
		try
		{
			await initialise(toolbar);
			
			toolbar.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[PlatformSettingsToolbar] Error initialising:", toolbar, error);
		}
	}
}