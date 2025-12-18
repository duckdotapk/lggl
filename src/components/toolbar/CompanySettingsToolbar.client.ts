//
// Imports
//

import { getElementOrThrow, getInputEnumValue } from "@lorenstuff/browser-utilities";

import { initialiseForm } from "../../libs/client/Input.client.js";
import { defaultSelector, reloadView } from "../../libs/client/Pjax.client.js";

import { CompanyGroupModeSchema } from "../../libs/models/Setting.schemas.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as schema from "../../routes/api/setting/update.schemas.js";

//
// Locals
//

async function initialise(toolbar: HTMLFormElement)
{
	const companyGroupModeSelect = getElementOrThrow<HTMLSelectElement>(
		toolbar,
		`select[name="companyGroupMode"]`,
	);

	toolbar.addEventListener("submit", (event) => event.preventDefault());

	initialiseForm(
	{
		form: toolbar,
		submitter: companyGroupModeSelect,
		requireConfirmation: false,
		onSubmit: async () => await apiRequest(
		{
			schema,
			requestBody:
			{
				settingUpdates:
				[
					{
						name: "COMPANY_GROUP_MODE",
						value: getInputEnumValue(companyGroupModeSelect, CompanyGroupModeSchema),
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

export async function initialiseCompanySettingsToolbars()
{
	const toolbars = document.querySelectorAll<HTMLFormElement>(
		".component-company-settings-toolbar:not(.initialised)",
	);

	for (const toolbar of toolbars)
	{
		initialise(toolbar)
			.then(() => console.log("[CompanySettingsToolbar] Initialised:", toolbar))
			.catch((error) =>
				console.error("[CompanySettingsToolbar] Error initialising:", toolbar, error));
	}
}