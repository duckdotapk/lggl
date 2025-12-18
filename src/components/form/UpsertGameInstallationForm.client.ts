//
// Imports
//

import
{
	getChangedInputStringValue,
	getElementOrThrow,
	getInputStringValue,
	getIntegerData,
	getIntegerDataOrThrow,
} from "@lorenstuff/browser-utilities";

import { initialiseForm } from "../../libs/client/Input.client.js";
import { reloadView } from "../../libs/client/Pjax.client.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as createGameInstallationSchema from "../../routes/api/gameInstallation/create.schemas.js";
import * as deleteGameInstallationSchema from "../../routes/api/gameInstallation/delete.schemas.js";
import * as updateGameInstallationSchema from "../../routes/api/gameInstallation/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = getIntegerDataOrThrow(form, "gameId");
	const gameInstallationId = getIntegerData(form, "gameInstallationId");

	const pathInput = getElementOrThrow<HTMLInputElement>(form, `[name="path"]`);

	if (gameInstallationId == null)
	{
		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: createGameInstallationSchema,
				requestBody:
				{
					path: getInputStringValue(pathInput),

					game_id: gameId,
				}
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
				schema: deleteGameInstallationSchema,
				requestBody:
				{
					id: gameInstallationId,
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
				schema: updateGameInstallationSchema,
				requestBody:
				{
					id: gameInstallationId,
					updateData:
					{
						path: getChangedInputStringValue(pathInput),
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

export async function initialiseUpsertGameInstallationForms()
{
	const forms = document.querySelectorAll<HTMLFormElement>(
		".component-upsert-game-installation-form:not(.initialised)",
	);

	for (const form of forms)
	{
		initialise(form)
			.then(() => console.log("[UpsertGameInstallationForm] Initialised:", form))
			.catch((error) =>
				console.error("[UpsertGameInstallationForm] Error initialising:", form, error));
	}
}