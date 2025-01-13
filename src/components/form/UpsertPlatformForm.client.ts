//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";

import { createPlatform } from "../../routes/api/platform/create.schemas.js";
import { deletePlatform } from "../../routes/api/platform/delete.schemas.js";
import { updatePlatform } from "../../routes/api/platform/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const platformId = BrowserUtilities.ElementClientLib.getIntegerData(form, "platformId");

	const nameInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="name"]`);
	const iconNameInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="iconName"]`);

	if (platformId == null)
	{
		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await createPlatform(
					{
						name: InputClientLib.getStringValue(nameInput),
						iconName: InputClientLib.getStringValue(iconNameInput),
					}),
				onSuccess: async (response) => { window.location.href = "/platforms/view/" + response.platform.id; },
			});
	}
	else
	{
		const deleteButton = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLButtonElement>(form, `[data-action="delete"]`);

		InputClientLib.initialiseForm(
			{
				form,
				submitter: deleteButton,
				requireConfirmation: true,
				onSubmit: async () => await deletePlatform(platformId),
				onSuccess: async () => { window.location.href = "/platforms"; },
			});

		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await updatePlatform(platformId,
					{
						name: InputClientLib.getChangedStringValue(nameInput),
						iconName: InputClientLib.getChangedStringValue(iconNameInput),
					}),
				onSuccess: async () => { window.location.href = "/platforms/view/" + platformId; },
			});
	}
}

//
// Component
//

export async function initialiseUpsertPlatformForms()
{
	const upsertPlatformForms = document.querySelectorAll<HTMLFormElement>(".component-upsert-platform-form:not(.initialised)");

	for (const upsertPlatformForm of upsertPlatformForms)
	{
		try
		{
			await initialise(upsertPlatformForm);

			upsertPlatformForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[UpsertPlatformForm] Error initialising:", upsertPlatformForm, error);
		}
	}
}