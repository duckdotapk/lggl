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

	InputClientLib.initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await syncHistoricalPlayTime(gameId,
				{
					name: "steam",
					steamAppId: InputClientLib.getNumberValue(steamAppIdInput),
					updateFirstPlayedDate: InputClientLib.getBooleanValue(updateFirstPlayedDateInput),
					updateLastPlayedDate: InputClientLib.getBooleanValue(updateLastPlayedDateInput),
				}),
			onSuccess: async () => window.location.reload(),
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