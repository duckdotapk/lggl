//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";
import * as PjaxClientLib from "../../libs/client/Pjax.client.js";

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

	if (gameCompanyId == null)
	{
		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () =>await createGameCompany(
					{
						game_id: gameId,
						company_id: InputClientLib.getNumberValue(companyIdSelect),
						type: InputClientLib.getEnumValue(typeSelect, GameCompanySchemaLib.TypeSchema),
						notes: InputClientLib.getStringValueNullable(notesInput),
					}),
				onSuccess: async () => PjaxClientLib.reloadView(),
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
				onSubmit: async () => await deleteGameCompany(gameCompanyId),
				onSuccess: async () => PjaxClientLib.reloadView(),
			});

		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await updateGameCompany(gameCompanyId,
					{
						company_id: InputClientLib.getChangedNumberValue(companyIdSelect),
						type: InputClientLib.getChangedEnumValue(typeSelect, GameCompanySchemaLib.TypeSchema),
						notes: InputClientLib.getChangedStringValueNullable(notesInput),
					}),
				onSuccess: async () => PjaxClientLib.reloadView(),
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