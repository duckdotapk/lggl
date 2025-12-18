//
// Imports
//

import
{
	getElementOrThrow,
	getInputNumberValue,
	getIntegerData,
	getIntegerDataOrThrow,
} from "@lorenstuff/browser-utilities";

import { initialiseForm } from "../../libs/client/Input.client.js";
import { reloadView } from "../../libs/client/Pjax.client.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as createSeriesGameSchema from "../../routes/api/seriesGame/create.schemas.js";
import * as deleteSeriesGameSchema from "../../routes/api/seriesGame/delete.schemas.js";
import * as updateSeriesGameSchema from "../../routes/api/seriesGame/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const seriesId = getIntegerDataOrThrow(form, "seriesId");
	const seriesGameId = getIntegerData(form, "seriesGameId");

	const gameIdSelect = getElementOrThrow<HTMLSelectElement>(form, `[name="game_id"]`);
	const numberInput = getElementOrThrow<HTMLInputElement>(form, `[name="number"]`);

	if (seriesGameId == null)
	{
		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: createSeriesGameSchema,
				requestBody:
				{
					number: getInputNumberValue(numberInput),

					game_id: getInputNumberValue(gameIdSelect),
					series_id: seriesId,
				},
			}).getResponse(),
			onSuccess: async () => reloadView(),
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
				schema: deleteSeriesGameSchema,
				requestBody:
				{
					id: seriesGameId,
				},
			}).getResponse(),
			onSuccess: async () => reloadView(),
		});

		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: updateSeriesGameSchema,
				requestBody:
				{
					id: seriesGameId,
					updateData:
					{
						number: getInputNumberValue(numberInput),

						game_id: getInputNumberValue(gameIdSelect),
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

export async function initialiseUpsertSeriesGameForms()
{
	const forms = document.querySelectorAll<HTMLFormElement>(
		".component-upsert-series-game-form:not(.initialised)",
	);

	for (const form of forms)
	{
		initialise(form)
			.then(() => console.log("[UpsertSeriesGameForm] Initialised:", form))
			.catch((error) =>
				console.error("[UpsertSeriesGameForm] Error initialising:", form, error));
	}
}