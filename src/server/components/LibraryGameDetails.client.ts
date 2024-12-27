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
	const launchButton = BrowserUtilities.ElementClientLib.getElement<HTMLButtonElement>(element, `[data-launch-game-id]`);

	if (launchButton != null)
	{
		const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(launchButton, "launchGameId");

		launchButton.addEventListener("click",
			async () =>
			{
				const response = await launchGame(gameId);

				// TODO: show feedback of some kind
				console.log(response);
			});
	}
}

//
// Components
//

export async function initialiseLibraryGameDetails()
{
	const libraryGameDetails = document.querySelector<HTMLElement>(".component-library-game-details:not(.initialised)");

	if (libraryGameDetails == null)
	{
		return;
	}

	try
	{
		await initialise(libraryGameDetails);
		
		libraryGameDetails.classList.add("initialised");
	}
	catch (error)
	{
		console.error("[LibraryGameDetails] Error initialising:", libraryGameDetails, error);
	}
}