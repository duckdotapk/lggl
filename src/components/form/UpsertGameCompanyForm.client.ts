//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";

import * as GameCompanySchemaLib from "../../libs/schemas/GameCompany.js";

import { createGameCompany } from "../../routes/api/gameCompany/create.schemas.js";
import { deleteGameCompany } from "../../routes/api/gameCompany/delete.schemas.js";
import { updateGameCompany } from "../../routes/api/gameCompany/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(form, "gameId");
	const gameCompanyId = BrowserUtilities.ElementClientLib.getIntegerData(form, "gameCompanyId");

	const companyIdSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(form, `[name="company_id"]`);
	const typeSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(form, `[name="type"]`);
	const notesInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="notes"]`);

	const deleteButton = BrowserUtilities.ElementClientLib.getElement<HTMLButtonElement>(form, `[data-action="delete"]`);
	const saveButton = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLButtonElement>(form, `[data-action="save"]`);

	form.addEventListener("submit", (event) => event.preventDefault());

	if (gameCompanyId == null)
	{
		saveButton.addEventListener("click",
			async () =>
			{
				try
				{
					InputClientLib.disableInputs(form);

					const response = await createGameCompany(
						{
							game_id: gameId,
							company_id: InputClientLib.getNumberValue(companyIdSelect),
							type: InputClientLib.getEnumValue(typeSelect, GameCompanySchemaLib.TypeSchema),
							notes: InputClientLib.getStringValue(notesInput),
						});

					// TODO: show notifications on success/failure

					if (!response.success)
					{
						return console.error("[UpsertGameCompanyForm] Error creating GameCompany:", response.errors);
					}

					// TODO: don't reload the page here
					window.location.reload();
				}
				catch (error)
				{
					console.error("[UpsertGameCompanyForm] Error creating GameCompany:", error);
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
	
					const response = await deleteGameCompany(gameCompanyId);
	
					// TODO: show notifications on success/failure
	
					if (!response.success)
					{
						return console.error("[UpsertGameCompanyForm] Error deleting GameCompany:", response.errors);
					}
	
					form.remove();
				}
				catch (error)
				{
					console.error("[UpsertGameCompanyForm] Error deleting GameCompany:", error);
				}
				finally
				{
					InputClientLib.enableInputs(form);
				}
			});

		saveButton.addEventListener("click",
			async () =>
			{
				try
				{
					InputClientLib.disableInputs(form);

					const response = await updateGameCompany(gameCompanyId,
						{
							company_id: InputClientLib.getChangedNumberValue(companyIdSelect),
							type: InputClientLib.getChangedEnumValue(typeSelect, GameCompanySchemaLib.TypeSchema),
							notes: InputClientLib.getChangedStringValue(notesInput),
						});

					// TODO: show notifications on success/failure

					if (!response.success)
					{
						return console.error("[UpsertGameCompanyForm] Error updating GameCompany:", response.errors);
					}

					InputClientLib.clearDirtyInputs(form);
				}
				catch (error)
				{
					console.error("[UpsertGameCompanyForm] Error updating GameCompany:", error);
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

export async function initialiseUpsertGameCompanyForms()
{
	const upsertGameCompanyForms = document.querySelectorAll<HTMLFormElement>(".component-upsert-game-company-form:not(.initialised)");

	for (const upsertGameCompanyForm of upsertGameCompanyForms)
	{
		try
		{
			await initialise(upsertGameCompanyForm);

			upsertGameCompanyForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[UpsertGameCompanyForm] Error initialising:", upsertGameCompanyForm, error);
		}
	}
}