//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";

import { syncHistoricalPlayTime } from "../../routes/api/game/syncHistoricalPlaytime.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(form, "gameId");

	const steamAppIdInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="steamAppId"]`);
	const updateFirstPlayedDateInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="updateFirstPlayedDate"]`);
	const updateLastPlayedDateInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="updateLastPlayedDate"]`);

	form.addEventListener("submit",
		async (event) =>
		{
			event.preventDefault();

			try
			{
				InputClientLib.disableInputs(form);

				const response = await syncHistoricalPlayTime(gameId,
					{
						name: "steam",
						steamAppId: InputClientLib.getNumberValue(steamAppIdInput),
						updateFirstPlayedDate: InputClientLib.getBooleanValue(updateFirstPlayedDateInput),
						updateLastPlayedDate: InputClientLib.getBooleanValue(updateLastPlayedDateInput),
					});

				// TODO: show notifications on success/failure

				if (!response.success)
				{
					return console.error("[SyncGameHistoricalPlayTimeForm] Error syncing play time:", response.errors);
				}

				window.location.reload();
			}
			catch (error)
			{
				console.error("[SyncGameHistoricalPlayTimeForm] Error syncing play time:", error);
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

export async function initialiseSyncGameHistoricalSteamPlayTimeForm()
{
	const syncGameHistoricalSteamPlayTimeForms = document.querySelectorAll<HTMLFormElement>(".component-sync-game-historical-play-time-form:not(.initialised)");

	for (const syncGameHistoricalSteamPlayTimeForm of syncGameHistoricalSteamPlayTimeForms)
	{
		try
		{
			await initialise(syncGameHistoricalSteamPlayTimeForm);

			syncGameHistoricalSteamPlayTimeForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[SyncGameHistoricalPlayTimeForm] Error initialising:", syncGameHistoricalSteamPlayTimeForm, error);
		}
	}
}