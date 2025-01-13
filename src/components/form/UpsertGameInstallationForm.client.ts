//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";

import { createGameInstallation } from "../../routes/api/gameInstallation/create.schemas.js";
import { deleteGameInstallation } from "../../routes/api/gameInstallation/delete.schemas.js";
import { updateGameInstallation } from "../../routes/api/gameInstallation/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(form, "gameId");
	const gameInstallationId = BrowserUtilities.ElementClientLib.getIntegerData(form, "gameInstallationId");

	const pathInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="path"]`);

	if (gameInstallationId == null)
	{
		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await createGameInstallation(
					{
						game_id: gameId,
						path: InputClientLib.getStringValue(pathInput),
					}),
				onSuccess: async () => window.location.reload(),
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
				onSubmit: async () => await deleteGameInstallation(gameInstallationId),
				onSuccess: async () => window.location.reload(),
			});

		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await updateGameInstallation(gameInstallationId,
					{
						path: InputClientLib.getChangedStringValue(pathInput),
					}),
				onSuccess: async () => window.location.reload(),
			});
	}
}

//
// Component
//

export async function initialiseUpsertGameInstallationForms()
{
	const upsertGameInstallationForms = document.querySelectorAll<HTMLFormElement>(".component-upsert-game-installation-form:not(.initialised)");

	for (const upsertGameInstallationForm of upsertGameInstallationForms)
	{
		try
		{
			await initialise(upsertGameInstallationForm);

			upsertGameInstallationForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[UpsertGameInstallationForm] Error initialising:", upsertGameInstallationForm, error);
		}
	}
}