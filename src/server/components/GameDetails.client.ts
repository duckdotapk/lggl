//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import { launchGame } from "../routes/api/game/launch.schemas.js";

//
// Locals
//

async function initialise(element: HTMLElement)
{
	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(element, "gameId");

	const buttons = element.querySelectorAll<HTMLButtonElement>(`[data-game-play-action-id]`);

	for (const button of buttons)
	{
		const gamePlayActionId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(button, "gamePlayActionId");

		button.addEventListener("click",
			async () =>
			{
				try
				{
					button.disabled = true;

					const response = await launchGame(gameId, gamePlayActionId);

					// TODO: show errors somewhere
					console.log("[GamePlayActionButtonGroup] Launched game:", response);
				}
				finally
				{
					button.disabled = false;
				}
			});
	}
}

//
// Components
//

export async function initialiseGameDetails()
{
	const gameDetails = document.querySelectorAll<HTMLElement>(".component-game-play-action-button-group:not(.initialised)");

	for (const element of gameDetails)
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