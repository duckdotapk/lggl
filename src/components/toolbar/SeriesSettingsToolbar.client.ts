//
// Imports
//

import { getElementOrThrow, getInputEnumValue } from "@lorenstuff/browser-utilities";

import { initialiseForm } from "../../libs/client/Input.client.js";
import { defaultSelector, reloadView } from "../../libs/client/Pjax.client.js";

import { SeriesGroupModeSchema } from "../../libs/models/Setting.schemas.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as schema from "../../routes/api/setting/update.schemas.js";

//
// Locals
//

async function initialise(toolbar: HTMLFormElement)
{
	const seriesGroupModeSelect = getElementOrThrow<HTMLSelectElement>(
		toolbar,
		`select[name="seriesGroupMode"]`,
	);

	toolbar.addEventListener("submit", (event) => event.preventDefault());

	initialiseForm(
	{
		form: toolbar,
		submitter: seriesGroupModeSelect,
		requireConfirmation: false,
		onSubmit: async () => await apiRequest(
		{
			schema,
			requestBody:
			{
				settingUpdates:
				[
					{
						name: "SERIES_GROUP_MODE",
						value: getInputEnumValue(seriesGroupModeSelect, SeriesGroupModeSchema),
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

export async function initialiseSeriesSettingsToolbars()
{
	const toolbars = document.querySelectorAll<HTMLFormElement>(
		".component-series-settings-toolbar:not(.initialised)",
	);

	for (const toolbar of toolbars)
	{
		initialise(toolbar)
			.then(() => console.log("[SeriesSettingsToolbar] Initialised:", toolbar))
			.catch((error) =>
				console.error("[SeriesSettingsToolbar] Error initialising:", toolbar, error));
	}
}