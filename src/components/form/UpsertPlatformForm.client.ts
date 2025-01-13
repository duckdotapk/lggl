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

	const deleteButton = BrowserUtilities.ElementClientLib.getElement<HTMLButtonElement>(form, `[data-action="delete"]`);

	if (platformId == null)
	{
		form.addEventListener("submit",
			async (event) =>
			{
				event.preventDefault();

				try
				{
					InputClientLib.disableInputs(form);

					const response = await createPlatform(
						{
							name: InputClientLib.getStringValue(nameInput),
							iconName: InputClientLib.getStringValue(iconNameInput),
						});

					// TODO: show notifications on success/failure

					if (!response.success)
					{
						return console.error("[UpsertPlatformForm] Error creating Platform:", response.errors);
					}

					window.location.href = "/platforms/view/" + response.platform.id;
				}
				catch (error)
				{
					console.error("[UpsertPlatformForm] Error creating Platform:", error);
				}
				finally
				{
	
					InputClientLib.enableInputs(form);
				}
			});
	}
	else
	{
		deleteButton?.addEventListener("click",
			async () =>
			{
				try
				{
					InputClientLib.disableInputs(form);
				
					// TODO: prompt for confirmation
	
					const response = await deletePlatform(platformId);
	
					// TODO: show notifications on success/failure
	
					if (!response.success)
					{
						return console.error("[UpsertPlatformForm] Error deleting Platform:", response.errors);
					}
	
					window.location.href = "/platforms";
				}
				catch (error)
				{
					console.error("[UpsertPlatformForm] Error deleting Platform:", error);
				}
				finally
				{
					InputClientLib.enableInputs(form);
				}
			});

		form.addEventListener("submit",
			async (event) =>
			{
				event.preventDefault();

				try
				{
					InputClientLib.disableInputs(form);

					const response = await updatePlatform(platformId,
						{
							name: InputClientLib.getChangedStringValue(nameInput),
							iconName: InputClientLib.getChangedStringValue(iconNameInput),
						});

					// TODO: show notifications on success/failure

					if (!response.success)
					{
						return console.error("[UpsertPlatformForm] Error updating Platform:", response.errors);
					}

					InputClientLib.clearDirtyInputs(form);
				}
				catch (error)
				{
					console.error("[UpsertPlatformForm] Error updating Platform:", error);
				}
				finally
				{
					InputClientLib.enableInputs(form);
				}
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