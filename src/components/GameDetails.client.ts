//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import { launchGame } from "../routes/api/game/launch.schemas.js";
import { updateGame } from "../routes/api/game/update.schemas.js";

//
// Locals
//

async function initialise(element: HTMLElement)
{
	//
	// Get Data
	//

	const id = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(element, "gameId");

	//
	// Get Elements
	//

	const gamePlayActionButtons = element.querySelectorAll<HTMLButtonElement>(`[data-game-play-action-id]`);
	
	const isEarlyAccessInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(element, "[name='isEarlyAccess']");
	const isFavoriteInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(element, "[name='isFavorite']");	
	const isHiddenInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(element, "[name='isHidden']");
	const isNsfwInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(element, "[name='isNsfw']");
	const isShelvedInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(element, "[name='isShelved']");

	//
	// Add Event Listeners
	//

	for (const gamePlayActionButton of gamePlayActionButtons)
	{
		const gamePlayActionId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(gamePlayActionButton, "gamePlayActionId");

		gamePlayActionButton.addEventListener("click",
			async () =>
			{
				try
				{
					gamePlayActionButton.disabled = true;

					const response = await launchGame(id, gamePlayActionId);

					// TODO: show errors somewhere
					console.log("[GamePlayActionButtonGroup] Launched game:", response);
				}
				finally
				{
					gamePlayActionButton.disabled = false;
				}
			});
	}	

	isEarlyAccessInput.addEventListener("change", () => updateGame(id, { isEarlyAccess: isEarlyAccessInput.checked }));
	isFavoriteInput.addEventListener("change", () => updateGame(id, { isFavorite: isFavoriteInput.checked }));
	isHiddenInput.addEventListener("change", () => updateGame(id, { isHidden: isHiddenInput.checked }));
	isNsfwInput.addEventListener("change", () => updateGame(id, { isNsfw: isNsfwInput.checked }));
	isShelvedInput.addEventListener("change", () => updateGame(id, { isShelved: isShelvedInput.checked }));
}

//
// Components
//

export async function initialiseGameDetails()
{
	const elements = document.querySelectorAll<HTMLElement>(".component-game-details:not(.initialised)");

	for (const element of elements)
	{
		try
		{
			await initialise(element);
			
			element.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[GamePlayActionButtonGroup] Error initialising:", element, error);
		}
	}
}