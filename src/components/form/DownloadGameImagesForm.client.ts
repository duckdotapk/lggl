//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";
import * as PjaxClientLib from "../../libs/client/Pjax.client.js";

import { downloadImages } from "../../routes/api/game/downloadImages.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(form, "gameId");

	const steamAppIdInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="steamAppId"]`);

	InputClientLib.initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await downloadImages(gameId,
				{
					name: "steam",
					steamAppId: InputClientLib.getNumberValue(steamAppIdInput),
				}),
			onSuccess: async () => PjaxClientLib.reloadView(),
		});
}

//
// Component
//

export async function initialiseDownloadGameImagesForms()
{
	const downloadGameImagesForms = document.querySelectorAll<HTMLFormElement>(".component-download-game-images-form:not(.initialised)");

	for (const downloadGameImagesForm of downloadGameImagesForms)
	{
		try
		{
			await initialise(downloadGameImagesForm);

			downloadGameImagesForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[DownloadGameImagesForm] Error initialising:", downloadGameImagesForm, error);
		}
	}
}