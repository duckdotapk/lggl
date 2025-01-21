//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";
import * as PjaxClientLib from "../../libs/client/Pjax.client.js";

import { createSeriesGame } from "../../routes/api/seriesGame/create.schemas.js";
import { deleteSeriesGame } from "../../routes/api/seriesGame/delete.schemas.js";
import { updateSeriesGame } from "../../routes/api/seriesGame/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const seriesId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(form, "seriesId");
	const seriesGameId = BrowserUtilities.ElementClientLib.getIntegerData(form, "seriesGameId");

	const gameIdSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(form, `[name="game_id"]`);
	const numberInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="number"]`);

	if (seriesGameId == null)
	{
		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () =>await createSeriesGame(
					{
						number: InputClientLib.getNumberValue(numberInput),

						game_id: InputClientLib.getNumberValue(gameIdSelect),
						series_id: seriesId,
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
				onSubmit: async () => await deleteSeriesGame(seriesGameId),
				onSuccess: async () => PjaxClientLib.reloadView(),
			});

		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await updateSeriesGame(seriesGameId,
					{
						number: InputClientLib.getNumberValue(numberInput),

						game_id: InputClientLib.getNumberValue(gameIdSelect),
					}),
				onSuccess: async () => PjaxClientLib.reloadView(),
			});
	}
}

//
// Component
//

export async function initialiseUpsertSeriesGameForms()
{
	const upsertSeriesGameForms = document.querySelectorAll<HTMLFormElement>(".component-upsert-series-game-form:not(.initialised)");

	for (const upsertSeriesGameForm of upsertSeriesGameForms)
	{
		try
		{
			await initialise(upsertSeriesGameForm);

			upsertSeriesGameForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[UpsertSeriesGameForm] Error initialising:", upsertSeriesGameForm, error);
		}
	}
}