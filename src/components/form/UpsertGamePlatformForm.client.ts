//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";
import * as PjaxClientLib from "../../libs/client/Pjax.client.js";

import { createGamePlatform } from "../../routes/api/gamePlatform/create.schemas.js";
import { deleteGamePlatform } from "../../routes/api/gamePlatform/delete.schemas.js";
import { updateGamePlatform } from "../../routes/api/gamePlatform/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(form, "gameId");
	const gamePlatformId = BrowserUtilities.ElementClientLib.getIntegerData(form, "gamePlatformId");

	const platformIdSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(form, `[name="platform_id"]`);

	if (gamePlatformId == null)
	{
		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await createGamePlatform(
					{
						game_id: gameId,
						platform_id: InputClientLib.getNumberValue(platformIdSelect),
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
				onSubmit: async () => await deleteGamePlatform(gamePlatformId),
				onSuccess: async () => PjaxClientLib.reloadView(),
			});

		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await updateGamePlatform(gamePlatformId,
					{
						platform_id: InputClientLib.getChangedNumberValue(platformIdSelect),
					}),
				onSuccess: async () => PjaxClientLib.reloadView(),
			});
	}
}

//
// Component
//

export async function initialiseUpsertGamePlatformForms()
{
	const upsertGamePlatformForms = document.querySelectorAll<HTMLFormElement>(".component-upsert-game-platform-form:not(.initialised)");

	for (const upsertGamePlatformForm of upsertGamePlatformForms)
	{
		try
		{
			await initialise(upsertGamePlatformForm);

			upsertGamePlatformForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[UpsertGamePlatformForm] Error initialising:", upsertGamePlatformForm, error);
		}
	}
}