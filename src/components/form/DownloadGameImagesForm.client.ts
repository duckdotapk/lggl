//
// Imports
//

import
{
	getElementOrThrow,
	getIntegerDataOrThrow,
	getInputNumberValue,
} from "@lorenstuff/browser-utilities";

import { initialiseForm } from "../../libs/client/Input.client.js";
import { reloadView } from "../../libs/client/Pjax.client.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as schema from "../../routes/api/game/downloadImages.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = getIntegerDataOrThrow(form, "gameId");

	const steamAppIdInput = getElementOrThrow<HTMLInputElement>(form, `[name="steamAppId"]`);

	initialiseForm(
	{
		form,
		submitter: form,
		requireConfirmation: false,
		onSubmit: async () => await apiRequest(
		{
			schema,
			requestBody:
			{
				id: gameId,
				provider:
				{
					name: "steam",
					steamAppId: getInputNumberValue(steamAppIdInput),
				},
			},
		}).getResponse(),
		onSuccess: async () => reloadView(),
	});

	form.classList.add("initialised");
}

//
// Component
//

export async function initialiseDownloadGameImagesForms()
{
	const forms = document.querySelectorAll<HTMLFormElement>(
		".component-download-game-images-form:not(.initialised)",
	);

	for (const form of forms)
	{
		initialise(form)
			.then(() => console.log("[DownloadGameImagesForm] Initialised:", form))
			.catch((error) =>
				console.error("[DownloadGameImagesForm] Error initialising:", form, error));
	}
}