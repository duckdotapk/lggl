//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";
import * as PjaxClientLib from "../../libs/client/Pjax.client.js";

import { createGameEngine } from "../../routes/api/gameEngine/create.schemas.js";
import { deleteGameEngine } from "../../routes/api/gameEngine/delete.schemas.js";
import { updateGameEngine } from "../../routes/api/gameEngine/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(form, "gameId");
	const gameEngineId = BrowserUtilities.ElementClientLib.getIntegerData(form, "gameEngineId");

	const engineIdSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(form, `[name="engine_id"]`);
	const versionInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="version"]`);
	const notesInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="notes"]`);

	if (gameEngineId == null)
	{
		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await createGameEngine(
					{
						game_id: gameId,
						engine_id: InputClientLib.getNumberValue(engineIdSelect),
						version: InputClientLib.getStringValueNullable(versionInput),
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
				onSubmit: async () => await deleteGameEngine(gameEngineId),
				onSuccess: async () => PjaxClientLib.reloadView(),
			});

		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await updateGameEngine(gameEngineId,
					{
						engine_id: InputClientLib.getChangedNumberValue(engineIdSelect),
						version: InputClientLib.getChangedStringValueNullable(versionInput),
						notes: InputClientLib.getChangedStringValueNullable(notesInput),
					}),
				onSuccess: async () => PjaxClientLib.reloadView(),
			});
	}
}

//
// Component
//

export async function initialiseUpsertGameEngineForms()
{
	const upsertGameEngineForms = document.querySelectorAll<HTMLFormElement>(".component-upsert-game-engine-form:not(.initialised)");

	for (const upsertGameEngineForm of upsertGameEngineForms)
	{
		try
		{
			await initialise(upsertGameEngineForm);

			upsertGameEngineForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[UpsertGameEngineForm] Error initialising:", upsertGameEngineForm, error);
		}
	}
}