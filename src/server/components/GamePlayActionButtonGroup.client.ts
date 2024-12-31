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
	const buttons = element.querySelectorAll<HTMLButtonElement>("button.component-button");

	for (const button of buttons)
	{
		const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(button, "gameId");
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

export async function initialiseGamePlayActionButtonGroups()
{
	const gamePlayActionButtonGroups = document.querySelectorAll<HTMLElement>(".component-game-play-action-button-group:not(.initialised)");

	for (const element of gamePlayActionButtonGroups)
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