//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";

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

	const deleteButton = BrowserUtilities.ElementClientLib.getElement<HTMLButtonElement>(form, `[data-action="delete"]`);

	if (engineId == null)
	{
		form.addEventListener("submit",
			async (event) =>
			{
				event.preventDefault();

				try
				{
					InputClientLib.disableInputs(form);

					const response = await createEngine(
						{
							name: InputClientLib.getStringValue(nameInput),
							shortName: InputClientLib.getStringValueNullable(shortNameInput),
						});

					// TODO: show notifications on success/failure

					if (!response.success)
					{
						return console.error("[UpsertEngineForm] Error creating Engine:", response.errors);
					}

					window.location.href = "/engines/view/" + response.engine.id;
				}
				catch (error)
				{
					console.error("[UpsertEngineForm] Error creating Engine:", error);
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
	
					const response = await deleteEngine(engineId);
	
					// TODO: show notifications on success/failure
	
					if (!response.success)
					{
						return console.error("[UpsertEngineForm] Error deleting Engine:", response.errors);
					}
	
					window.location.href = "/engines";
				}
				catch (error)
				{
					console.error("[UpsertEngineForm] Error deleting Engine:", error);
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

					const response = await updateEngine(engineId,
						{
							name: InputClientLib.getChangedStringValue(nameInput),
							shortName: InputClientLib.getChangedStringValueNullable(shortNameInput),
						});

					// TODO: show notifications on success/failure

					if (!response.success)
					{
						return console.error("[UpsertEngineForm] Error updating Engine:", response.errors);
					}

					InputClientLib.clearDirtyInputs(form);
				}
				catch (error)
				{
					console.error("[UpsertEngineForm] Error updating Engine:", error);
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