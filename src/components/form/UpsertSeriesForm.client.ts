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

import * as createSeriesSchema from "../../routes/api/series/create.schemas.js";
import * as deleteSeriesSchema from "../../routes/api/series/delete.schemas.js";
import * as updateSeriesSchema from "../../routes/api/series/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const seriesId = getIntegerData(form, "seriesId");

	const nameInput = getElementOrThrow<HTMLInputElement>(form, `[name="name"]`);

	if (seriesId == null)
	{
		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: createSeriesSchema,
				requestBody:
				{
					name: getInputStringValue(nameInput),
				},
			}).getResponse(),
			onSuccess: async (response) => changeView("/series/edit/" + response.series.id),
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
				schema: deleteSeriesSchema,
				requestBody:
				{
					id: seriesId,
				},
			}).getResponse(),
			onSuccess: async () => changeView("/series"),
		});

		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: updateSeriesSchema,
				requestBody:
				{
					id: seriesId,
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

export async function initialiseUpsertSeriesForms()
{
	const forms = document.querySelectorAll<HTMLFormElement>(
		".component-upsert-series-form:not(.initialised)",
	);

	for (const form of forms)
	{
		initialise(form)
			.then(() => console.log("[UpsertSeriesForm] Initialised:", form))
			.catch((error) => console.error("[UpsertSeriesForm] Error initialising:", form, error));
	}
}