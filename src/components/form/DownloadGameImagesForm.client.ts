//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";

import { downloadImages } from "../../routes/api/game/downloadImages.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(form, "gameId");

	const steamAppIdInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="steamAppId"]`);

	form.addEventListener("submit",
		async (event) =>
		{
			event.preventDefault();

			try
			{
				InputClientLib.disableInputs(form);

				const response = await downloadImages(gameId,
					{
						name: "steam",
						steamAppId: InputClientLib.getNumberValue(steamAppIdInput),
					});

				// TODO: show notifications on success/failure

				if (!response.success)
				{
					return console.error("[DownloadGameImagesForm] Error downloading images:", response.errors);
				}

				window.location.reload();
			}
			catch (error)
			{
				console.error("[DownloadGameImagesForm] Error downloading images:", error);
			}
			finally
			{

				InputClientLib.enableInputs(form);
			}
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