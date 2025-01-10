//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";

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

	const deleteButton = BrowserUtilities.ElementClientLib.getElement<HTMLButtonElement>(form, `[data-action="delete"]`);

	if (companyId == null)
	{
		form.addEventListener("submit",
			async (event) =>
			{
				event.preventDefault();

				try
				{
					InputClientLib.disableInputs(form);

					const response = await createCompany(
						{
							name: InputClientLib.getStringValue(nameInput),
						});

					// TODO: show notifications on success/failure

					if (!response.success)
					{
						return console.error("[UpsertCompanyForm] Error creating Company:", response.errors);
					}

					// TODO: don't reload the page here
					window.location.href = "/companies/view/" + response.company.id;
				}
				catch (error)
				{
					console.error("[UpsertCompanyForm] Error creating Company:", error);
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
	
					const response = await deleteCompany(companyId);
	
					// TODO: show notifications on success/failure
	
					if (!response.success)
					{
						return console.error("[UpserCompanyForm] Error deleting Company:", response.errors);
					}
	
					window.location.href = "/companies";
				}
				catch (error)
				{
					console.error("[UpsertCompanyForm] Error deleting Company:", error);
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

					const response = await updateCompany(companyId,
						{
							name: InputClientLib.getChangedStringValue(nameInput),
						});

					// TODO: show notifications on success/failure

					if (!response.success)
					{
						return console.error("[UpsertCompanyForm] Error updating Company:", response.errors);
					}

					InputClientLib.clearDirtyInputs(form);
				}
				catch (error)
				{
					console.error("[UpsertCompanyForm] Error updating Company:", error);
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