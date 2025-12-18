//
// Imports
//

import
{
	getChangedInputStringValue,
	getElementOrThrow,
	getInputStringValue,
	getIntegerData,
} from "@lorenstuff/browser-utilities";

import { initialiseForm } from "../../libs/client/Input.client.js";
import { changeView, reloadView } from "../../libs/client/Pjax.client.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as createPlatformSchema from "../../routes/api/platform/create.schemas.js";
import * as deletePlatformSchema from "../../routes/api/platform/delete.schemas.js";
import * as updatePlatformSchema from "../../routes/api/platform/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const platformId = getIntegerData(form, "platformId");

	const nameInput = getElementOrThrow<HTMLInputElement>(form, `[name="name"]`);
	const iconNameInput = getElementOrThrow<HTMLInputElement>(form, `[name="iconName"]`);

	if (platformId == null)
	{
		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: createPlatformSchema,
				requestBody:
				{
					name: getInputStringValue(nameInput),
					iconName: getInputStringValue(iconNameInput),
				},
			}).getResponse(),
			onSuccess: async (response) => changeView("/platforms/edit/" + response.platform.id),
		});
	}
	else
	{
		const deleteButton = getElementOrThrow<HTMLButtonElement>(form, `[data-action="delete"]`);

		initialiseForm(
		{
			form,
			submitter: deleteButton,
			requireConfirmation: true,
			onSubmit: async () => await apiRequest(
			{
				schema: deletePlatformSchema,
				requestBody:
				{
					id: platformId,
				},
			}).getResponse(),
			onSuccess: async () => changeView("/platforms"),
		});

		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: updatePlatformSchema,
				requestBody:
				{
					id: platformId,
					updateData:
					{
						name: getChangedInputStringValue(nameInput),
						iconName: getChangedInputStringValue(iconNameInput),
					},
				},
			}).getResponse(),
			onSuccess: async () => reloadView(),
		});
	}

	form.classList.add("initialised");
}

//
// Component
//

export async function initialiseUpsertPlatformForms()
{
	const forms = document.querySelectorAll<HTMLFormElement>(
		".component-upsert-platform-form:not(.initialised)",
	);

	for (const form of forms)
	{
		initialise(form)
			.then(() => console.log("[UpsertPlatformForm] Initialised:", form))
			.catch((error) => console.error("[UpsertPlatformForm] Error initialising:", form, error));
	}
}