//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import { updateGame } from "../../routes/api/game/update.schemas.js";

//
// Locals
//

async function initialise(toolbar: HTMLFormElement)
{
	const id = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(toolbar, "gameId");

	const isEarlyAccessInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, "[name='isEarlyAccess']");

	const isFavoriteInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, "[name='isFavorite']");

	const isHiddenInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, "[name='isHidden']");

	const isNsfwInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, "[name='isNsfw']");

	const isShelvedInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(toolbar, "[name='isShelved']");

	const submit = async () =>
	{
		isEarlyAccessInput.disabled = true;
		isFavoriteInput.disabled = true;
		isHiddenInput.disabled = true;
		isNsfwInput.disabled = true;
		isShelvedInput.disabled = true;

		const response = await updateGame(id,
			{
				isEarlyAccess: isEarlyAccessInput.checked,
				isFavorite: isFavoriteInput.checked,
				isHidden: isHiddenInput.checked,
				isNsfw: isNsfwInput.checked,
				isShelved: isShelvedInput.checked,
			});

		// TODO: show result somehow
		console.log("[GameFlagsToolbar] Updated game:", response);
		
		window.location.reload();
	};

	toolbar.addEventListener("submit", () => submit());

	toolbar.addEventListener("change", () => submit());
}

//
// Components
//

export async function initialiseGameFlagsToolbars()
{
	const toolbars = document.querySelectorAll<HTMLFormElement>(".component-game-flags-toolbar:not(.initialised)");

	for (const toolbar of toolbars)
	{
		try
		{
			await initialise(toolbar);
			
			toolbar.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[GameFlagsToolbar] Error initialising:", toolbar, error);
		}
	}
}