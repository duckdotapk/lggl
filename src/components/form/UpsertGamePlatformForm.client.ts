//
// Imports
//

import
{
	getChangedInputNumberValue,
	getChangedInputStringValueNullable,
	getElementOrThrow,
	getInputNumberValue,
	getInputStringValueNullable,
	getIntegerData,
	getIntegerDataOrThrow,
} from "@lorenstuff/browser-utilities";

import { initialiseForm } from "../../libs/client/Input.client.js";
import { reloadView } from "../../libs/client/Pjax.client.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as createGamePlatformSchema from "../../routes/api/gamePlatform/create.schemas.js";
import * as deleteGamePlatformSchema from "../../routes/api/gamePlatform/delete.schemas.js";
import * as updateGamePlatformSchema from "../../routes/api/gamePlatform/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = getIntegerDataOrThrow(form, "gameId");
	const gamePlatformId = getIntegerData(form, "gamePlatformId");

	const platformIdSelect = getElementOrThrow<HTMLSelectElement>(form, `[name="platform_id"]`);
	const notesInput = getElementOrThrow<HTMLInputElement>(form, `[name="notes"]`);

	if (gamePlatformId == null)
	{
		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: createGamePlatformSchema,
				requestBody:
				{
					notes: getInputStringValueNullable(notesInput),

					game_id: gameId,
					platform_id: getInputNumberValue(platformIdSelect),
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
				schema: deleteGamePlatformSchema,
				requestBody:
				{
					id: gamePlatformId,
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
				schema: updateGamePlatformSchema,
				requestBody:
				{
					id: gamePlatformId,
					updateData:
					{
						notes: getChangedInputStringValueNullable(notesInput),

						platform_id: getChangedInputNumberValue(platformIdSelect),
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

export async function initialiseUpsertGamePlatformForms()
{
	const forms = document.querySelectorAll<HTMLFormElement>(
		".component-upsert-game-platform-form:not(.initialised)",
	);

	for (const form of forms)
	{
		initialise(form)
			.then(() => console.log("[UpsertGamePlatformForm] Initialised:", form))
			.catch((error) =>
				console.error("[UpsertGamePlatformForm] Error initialising:", form, error));
	}
}