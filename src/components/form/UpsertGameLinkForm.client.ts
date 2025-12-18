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

import * as createGameLinkSchema from "../../routes/api/gameLink/create.schemas.js";
import * as deleteGameLinkSchema from "../../routes/api/gameLink/delete.schemas.js";
import * as updateGameLinkSchema from "../../routes/api/gameLink/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = getIntegerDataOrThrow(form, "gameId");
	const gameLinkId = getIntegerData(form, "gameLinkId");

	const titleInput = getElementOrThrow<HTMLInputElement>(form, `[name="title"]`);
	const urlInput = getElementOrThrow<HTMLInputElement>(form, `[name="url"]`);

	if (gameLinkId == null)
	{
		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: createGameLinkSchema,
				requestBody:
				{
					game_id: gameId,
					title: getInputStringValue(titleInput),
					url: getInputStringValue(urlInput),
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
				schema: deleteGameLinkSchema,
				requestBody:
				{
					id: gameLinkId,
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
				schema: updateGameLinkSchema,
				requestBody:
				{
					id: gameLinkId,
					updateData:
					{
						title: getChangedInputStringValue(titleInput),
						url: getChangedInputStringValue(urlInput),
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

export async function initialiseUpsertGameLinkForms()
{
	const forms = document.querySelectorAll<HTMLFormElement>(
		".component-upsert-game-link-form:not(.initialised)",
	);

	for (const form of forms)
	{
		initialise(form)
			.then(() => console.log("[UpsertGameLinkForm] Initialised:", form))
			.catch((error) =>
				console.error("[UpsertGameLinkForm] Error initialising:", form, error));
	}
}