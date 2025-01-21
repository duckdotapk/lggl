//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";
import * as PjaxClientLib from "../../libs/client/Pjax.client.js";

import { createCompany } from "../../routes/api/company/create.schemas.js";
import { deleteCompany } from "../../routes/api/company/delete.schemas.js";
import { updateCompany } from "../../routes/api/company/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const companyId = BrowserUtilities.ElementClientLib.getIntegerData(form, "companyId");

	const nameInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="name"]`);

	if (companyId == null)
	{
		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await createCompany(
					{
						name: InputClientLib.getStringValue(nameInput),
					}),
				onSuccess: async (response) => PjaxClientLib.changeView("/companies/edit/" + response.company.id),
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
				onSubmit: async () => await deleteCompany(companyId),
				onSuccess: async () => PjaxClientLib.changeView("/companies"),
			});

		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () =>  await updateCompany(companyId,
					{
						name: InputClientLib.getChangedStringValue(nameInput),
					}),
				onSuccess: async () => PjaxClientLib.reloadView(),
			});
	}
}

//
// Component
//

export async function initialiseUpsertCompanyForms()
{
	const upsertCompanyForms = document.querySelectorAll<HTMLFormElement>(".component-upsert-company-form:not(.initialised)");

	for (const upsertCompanyForm of upsertCompanyForms)
	{
		try
		{
			await initialise(upsertCompanyForm);

			upsertCompanyForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[UpsertCompanyForm] Error initialising:", upsertCompanyForm, error);
		}
	}
}