//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import { GameNotesDialog } from "./GameNotesDialog.js";

import * as InputClientLib from "../../libs/client/Input.client.js";

import { findGame } from "../../routes/api/game/findOne.schemas.js";
import { updateGame } from "../../routes/api/game/update.schemas.js";

//
// Locals
//

async function initialise(dialog: HTMLDialogElement)
{
	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(dialog, "gameId");

	const form = BrowserUtilities.ElementClientLib.getElementOrThrow(dialog, "form");

	const notesTextArea = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLTextAreaElement>(form, `[name="notes"]`);

	form.addEventListener("submit",
		async (event) =>
		{
			event.preventDefault();

			const response = await updateGame(gameId,
				{
					notes: InputClientLib.getChangedStringValueNullable(notesTextArea),
				});

			if (!response.success)
			{
				return console.error("[GameNotesDialog] Failed to update game:", response.errors);
			}

			dialog.close();
		});

	dialog.addEventListener("close", () => dialog.remove());
}

async function initialiseOpenButton(button: HTMLButtonElement)
{
	const dialogContainer = BrowserUtilities.ElementClientLib.getElementOrThrow(document, ".dialog-container");

	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(button, "gameId");

	button.addEventListener("click",
		async () =>
		{
			const response = await findGame(gameId);

			if (!response.success)
			{
				// TODO: show notification
				return console.error("[GameNotesDialog] Failed to find game:", response.errors);
			}

			const dialog = await GameNotesDialog(response.game).renderToHTMLElement<HTMLDialogElement>();

			dialogContainer.appendChild(dialog);

			document.dispatchEvent(new CustomEvent("lggl:reinitialise"));

			dialog.showModal();
		});
}

//
// Component
//

export async function initialiseGameNotesDialogs()
{
	const dialogs = document.querySelectorAll<HTMLDialogElement>(`.component-game-notes-dialog:not(.initialised)`);

	for (const dialog of dialogs)
	{
		try
		{
			await initialise(dialog);

			dialog.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[GameNotesDialog] Failed to initialise dialog:", dialog, error);
		}
	}
}

export async function initialiseOpenGameNotesDialogButtons()
{
	const openButtons = document.querySelectorAll<HTMLButtonElement>(`[data-open-game-notes-dialog="true"]:not(.initialised)`);

	for (const openButton of openButtons)
	{
		try
		{
			await initialiseOpenButton(openButton);

			openButton.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[GameNotesDialog] Failed to initialise open button:", openButton, error);
		}
	}
}