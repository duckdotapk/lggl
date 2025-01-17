//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";
import * as PjaxClientLib from "../../libs/client/Pjax.client.js";

import { createGameLink } from "../../routes/api/gameLink/create.schemas.js";
import { deleteGameLink } from "../../routes/api/gameLink/delete.schemas.js";
import { updateGameLink } from "../../routes/api/gameLink/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(form, "gameId");
	const gameLinkId = BrowserUtilities.ElementClientLib.getIntegerData(form, "gameLinkId");

	const titleInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="title"]`);
	const urlInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="url"]`);

	if (gameLinkId == null)
	{
		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await createGameLink(
					{
						game_id: gameId,
						title: InputClientLib.getStringValue(titleInput),
						url: InputClientLib.getStringValue(urlInput),
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
				onSubmit: async () => await deleteGameLink(gameLinkId),
				onSuccess: async () => PjaxClientLib.reloadView(),
			});

		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await updateGameLink(gameLinkId,
					{
						title: InputClientLib.getChangedStringValue(titleInput),
						url: InputClientLib.getChangedStringValue(urlInput),
					}),
				onSuccess: async () => PjaxClientLib.reloadView(),
			});
	}
}

//
// Component
//

export async function initialiseUpsertGameLinkForms()
{
	const upsertGameLinkForms = document.querySelectorAll<HTMLFormElement>(".component-upsert-game-link-form:not(.initialised)");

	for (const upsertGameLinkForm of upsertGameLinkForms)
	{
		try
		{
			await initialise(upsertGameLinkForm);

			upsertGameLinkForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[UpsertGameLinkForm] Error initialising:", upsertGameLinkForm, error);
		}
	}
}