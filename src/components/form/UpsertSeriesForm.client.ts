//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";
import * as PjaxClientLib from "../../libs/client/Pjax.client.js";

import { createSeries } from "../../routes/api/series/create.schemas.js";
import { deleteSeries } from "../../routes/api/series/delete.schemas.js";
import { updateSeries } from "../../routes/api/series/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const seriesId = BrowserUtilities.ElementClientLib.getIntegerData(form, "seriesId");

	const nameInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="name"]`);

	if (seriesId == null)
	{
		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await createSeries(
					{
						name: InputClientLib.getStringValue(nameInput),
					}),
				onSuccess: async (response) => PjaxClientLib.changeView("/series/view/" + response.series.id),
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
				onSubmit: async () => await deleteSeries(seriesId),
				onSuccess: async () => PjaxClientLib.changeView("/series"),
			});

		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await updateSeries(seriesId,
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

export async function initialiseUpsertSeriesForms()
{
	const upsertSeriesForms = document.querySelectorAll<HTMLFormElement>(".component-upsert-series-form:not(.initialised)");

	for (const upsertSeriesForm of upsertSeriesForms)
	{
		try
		{
			await initialise(upsertSeriesForm);

			upsertSeriesForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[UpsertSeriesForm] Error initialising:", upsertSeriesForm, error);
		}
	}
}