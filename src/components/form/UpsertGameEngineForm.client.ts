//
// Imports
//

import {
	getChangedInputNumberValue,
	getChangedInputStringValueNullable,
	getElementOrThrow,
	getIntegerData,
	getIntegerDataOrThrow,
	getInputNumberValue,
	getInputStringValueNullable,
} from "@lorenstuff/browser-utilities";

import { initialiseForm } from "../../libs/client/Input.client.js";
import { reloadView } from "../../libs/client/Pjax.client.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as createGameEngineSchema from "../../routes/api/gameEngine/create.schemas.js";
import * as deleteGameEngineSchema from "../../routes/api/gameEngine/delete.schemas.js";
import * as updateGameEngineSchema from "../../routes/api/gameEngine/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = getIntegerDataOrThrow(form, "gameId");
	const gameEngineId = getIntegerData(form, "gameEngineId");

	const engineIdSelect = getElementOrThrow<HTMLSelectElement>(form, `[name="engine_id"]`);
	const versionInput = getElementOrThrow<HTMLInputElement>(form, `[name="version"]`);
	const notesInput = getElementOrThrow<HTMLInputElement>(form, `[name="notes"]`);

	if (gameEngineId == null)
	{
		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: createGameEngineSchema,
				requestBody:
				{
					game_id: gameId,
					engine_id: getInputNumberValue(engineIdSelect),
					version: getInputStringValueNullable(versionInput),
					notes: getInputStringValueNullable(notesInput),
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
				schema: deleteGameEngineSchema,
				requestBody:
				{
					id: gameEngineId,
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
				schema: updateGameEngineSchema,
				requestBody:
				{
					id: gameEngineId,
					updateData:
					{
						engine_id: getChangedInputNumberValue(engineIdSelect),
						version: getChangedInputStringValueNullable(versionInput),
						notes: getChangedInputStringValueNullable(notesInput),
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

export async function initialiseUpsertGameEngineForms()
{
	const forms = document.querySelectorAll<HTMLFormElement>(
		".component-upsert-game-engine-form:not(.initialised)",
	);

	for (const form of forms)
	{
		initialise(form)
			.then(() => console.log("[UpsertGameEngineForm] Initialised:", form))
			.catch((error) =>
				console.error("[UpsertGameEngineForm] Error initialising:", form, error));
	}
}