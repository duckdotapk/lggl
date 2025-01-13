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
	const companyGroupModeSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(toolbar, `select[name="companyGroupMode"]`);

	toolbar.addEventListener("submit", (event) => event.preventDefault());

	InputClientLib.initialiseForm(
		{
			form: toolbar,
			submitter: companyGroupModeSelect,
			requireConfirmation: false,
			onSubmit: async () => await updateSettings(
				{
					settingUpdates:
					[
						{
							name: "companyGroupMode",
							value: companyGroupModeSelect.value as SettingSchemaLib.CompanyGroupMode,
						},
					],
				}),
			onSuccess: async () => PjaxClientLib.reloadView(PjaxClientLib.defaultSelector),
		});
}

//
// Components
//

export async function initialiseCompanySettingsToolbars()
{
	const toolbars = document.querySelectorAll<HTMLFormElement>(".component-company-settings-toolbar:not(.initialised)");

	for (const toolbar of toolbars)
	{
		try
		{
			await initialise(toolbar);
			
			toolbar.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[CompanySettingsToolbar] Error initialising:", toolbar, error);
		}
	}
}