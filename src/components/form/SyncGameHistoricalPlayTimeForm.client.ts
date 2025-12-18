//
// Imports
//

import
{
	getElementOrThrow,
	getInputBooleanValue,
	getInputNumberValue,
	getIntegerDataOrThrow,
} from "@lorenstuff/browser-utilities";

import { initialiseForm } from "../../libs/client/Input.client.js";
import { reloadView } from "../../libs/client/Pjax.client.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as schema from "../../routes/api/game/syncHistoricalPlaytime.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = getIntegerDataOrThrow(form, "gameId");

	const steamAppIdInput = getElementOrThrow<HTMLInputElement>(form, `[name="steamAppId"]`);
	const updateFirstPlayedDateInput = getElementOrThrow<HTMLInputElement>(
		form,
		`[name="updateFirstPlayedDate"]`,
	);
	const updateLastPlayedDateInput = getElementOrThrow<HTMLInputElement>(
		form,
		`[name="updateLastPlayedDate"]`,
	);

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
					updateFirstPlayedDate: getInputBooleanValue(updateFirstPlayedDateInput),
					updateLastPlayedDate: getInputBooleanValue(updateLastPlayedDateInput),
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

export async function initialiseSyncGameHistoricalSteamPlayTimeForm()
{
	const forms = document.querySelectorAll<HTMLFormElement>(
		".component-sync-game-historical-play-time-form:not(.initialised)"
	);

	for (const form of forms)
	{
		initialise(form)
			.then(() => console.log("[SyncGameHistoricalPlayTimeForm] Initialised:", form))
			.catch((error) =>
				console.error("[SyncGameHistoricalPlayTimeForm] Error initialised:", form, error));
	}
}