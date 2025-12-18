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

import * as createCompanySchema from "../../routes/api/company/create.schemas.js";
import * as deleteCompanySchema from "../../routes/api/company/delete.schemas.js";
import * as updateCompanySchema from "../../routes/api/company/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const companyId = getIntegerData(form, "companyId");

	const nameInput = getElementOrThrow<HTMLInputElement>(form, `[name="name"]`);

	if (companyId == null)
	{
		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: createCompanySchema,
				requestBody:
				{
					name: getInputStringValue(nameInput),
				},
			}).getResponse(),
			onSuccess: async (response) => changeView("/companies/edit/" + response.company.id),
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
				schema: deleteCompanySchema,
				requestBody:
				{
					id: companyId,
				},
			}).getResponse(),
			onSuccess: async () => changeView("/companies"),
		});

		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: updateCompanySchema,
				requestBody:
				{
					id: companyId,
					updateData:
					{
						name: getChangedInputStringValue(nameInput),
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

export async function initialiseUpsertCompanyForms()
{
	const forms = document.querySelectorAll<HTMLFormElement>(
		".component-upsert-company-form:not(.initialised)",
	);

	for (const form of forms)
	{
		initialise(form)
			.then(() => console.log("[UpsertCompanyForm] Initialised:", form))
			.catch((error) =>
				console.error("[UpsertCompanyForm] Error initialising:", form, error));
	}
}