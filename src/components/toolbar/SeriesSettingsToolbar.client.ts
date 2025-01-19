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
	const seriesGroupModeSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(toolbar, `select[name="seriesGroupMode"]`);

	toolbar.addEventListener("submit", (event) => event.preventDefault());

	InputClientLib.initialiseForm(
		{
			form: toolbar,
			submitter: seriesGroupModeSelect,
			requireConfirmation: false,
			onSubmit: async () => await updateSettings(
				{
					settingUpdates:
					[
						{
							name: "seriesGroupMode",
							value: seriesGroupModeSelect.value as SettingSchemaLib.SeriesGroupMode,
						},
					],
				}),
			onSuccess: async () => PjaxClientLib.reloadView(PjaxClientLib.defaultSelector),
		});
}

//
// Components
//

export async function initialiseSeriesSettingsToolbars()
{
	const toolbars = document.querySelectorAll<HTMLFormElement>(".component-series-settings-toolbar:not(.initialised)");

	for (const toolbar of toolbars)
	{
		try
		{
			await initialise(toolbar);
			
			toolbar.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[SeriesSettingsToolbar] Error initialising:", toolbar, error);
		}
	}
}