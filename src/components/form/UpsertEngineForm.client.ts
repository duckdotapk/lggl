//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";
import * as PjaxClientLib from "../../libs/client/Pjax.client.js";

import { createEngine } from "../../routes/api/engine/create.schemas.js";
import { deleteEngine } from "../../routes/api/engine/delete.schemas.js";
import { updateEngine } from "../../routes/api/engine/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const engineId = BrowserUtilities.ElementClientLib.getIntegerData(form, "engineId");

	const nameInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="name"]`);
	const shortNameInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="shortName"]`);

	if (engineId == null)
	{
		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await createEngine(
					{
						name: InputClientLib.getStringValue(nameInput),
						shortName: InputClientLib.getStringValueNullable(shortNameInput),
					}),
				onSuccess: async (response) => PjaxClientLib.changeView("/engines/edit/" + response.engine.id),
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
				onSubmit: async () => await deleteEngine(engineId),
				onSuccess: async () => PjaxClientLib.changeView("/engines"),
			});

		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await updateEngine(engineId,
					{
						name: InputClientLib.getStringValue(nameInput),
						shortName: InputClientLib.getStringValueNullable(shortNameInput),
					}),
				onSuccess: async () => PjaxClientLib.reloadView(),
			});
	}
}

//
// Component
//

export async function initialiseUpsertEngineForms()
{
	const upsertEngineForms = document.querySelectorAll<HTMLFormElement>(".component-upsert-engine-form:not(.initialised)");

	for (const upsertEngineForm of upsertEngineForms)
	{
		try
		{
			await initialise(upsertEngineForm);

			upsertEngineForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[UpsertEngineForm] Error initialising:", upsertEngineForm, error);
		}
	}
}