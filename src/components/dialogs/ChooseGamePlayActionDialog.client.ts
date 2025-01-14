//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import { ChooseGamePlayActionDialog } from "./ChooseGamePlayActionDialog.js";

import { executeGamePlayAction } from "../../routes/api/gamePlayAction/execute.schemas.js";
import { findGamePlayActions } from "../../routes/api/gamePlayAction/findAll.schemas.js";

//
// Locals
//

async function initialise(dialog: HTMLDialogElement)
{
	const buttons = dialog.querySelectorAll<HTMLButtonElement>(".component-button");

	for (const button of buttons)
	{
		const gamePlayActionId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(button, "gamePlayActionId");

		button.addEventListener("click",
			async () =>
			{
				dialog.close();

				const response = await executeGamePlayAction(gamePlayActionId);

				if (!response.success)
				{
					// TODO: show notification
					console.error("[ChooseGamePlayActionDialog] Failed to launch game:", response.errors);
				}
			});
	}

	dialog.addEventListener("close", () => dialog.remove());
}

async function initialiseOpenButton(button: HTMLButtonElement)
{
	const dialogContainer = BrowserUtilities.ElementClientLib.getElementOrThrow(document, ".dialog-container");

	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(button, "gameId");

	button.addEventListener("click",
		async () =>
		{
			const findGamePlayActionsResponse = await findGamePlayActions(gameId);

			if (!findGamePlayActionsResponse.success)
			{
				// TODO: show notification
				return console.error("[ChooseGamePlayActionDialog] Failed to find game play actions:", findGamePlayActionsResponse.errors);
			}

			if (findGamePlayActionsResponse.gamePlayActions.length == 0)
			{
				// TODO: show notification
				return console.error("[ChooseGamePlayActionDialog] No game play actions found for game:", gameId);
			}

			if (findGamePlayActionsResponse.gamePlayActions.length == 1)
			{
				const launchGameResponse = await executeGamePlayAction(findGamePlayActionsResponse.gamePlayActions[0]!.id);

				if (!launchGameResponse.success)
				{
					// TODO: show notification
					return console.error("[ChooseGamePlayActionDialog] Failed to launch game:", launchGameResponse.errors);
				}

				return;
			}

			const dialog = ChooseGamePlayActionDialog(findGamePlayActionsResponse.gamePlayActions).renderToHTMLElement<HTMLDialogElement>();

			dialogContainer.appendChild(dialog);

			await initialise(dialog);

			dialog.showModal();
		});
}

//
// Component
//

export async function initialiseOpenChooseGamePlayActionDialogButtons()
{
	const openButtons = document.querySelectorAll<HTMLButtonElement>(`[data-open-choose-game-play-action-dialog="true"]:not(.initialised)`);

	for (const openButton of openButtons)
	{
		try
		{
			await initialiseOpenButton(openButton);

			openButton.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[ChooseGamePlayActionDialog] Failed to initialise open button:", openButton, error);
		}
	}
}