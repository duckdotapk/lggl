//
// Imports
//

import
{
	getChangedInputStringValueNullable,
	getElementOrThrow,
	getIntegerDataOrThrow,
} from "@lorenstuff/browser-utilities";

import { GameNotesDialog } from "./GameNotesDialog.js";

import { notyf } from "../../instances/notyf.js";

import { reloadView } from "../../libs/client/Pjax.client.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as findGameSchema from "../../routes/api/game/findOne.schemas.js";
import * as updateGameSchema from "../../routes/api/game/update.schemas.js";

//
// Locals
//

async function initialise(dialog: HTMLDialogElement)
{
	const gameId = getIntegerDataOrThrow(dialog, "gameId");

	const form = getElementOrThrow(dialog, "form");
	const notesTextArea = getElementOrThrow<HTMLTextAreaElement>(form, `[name="notes"]`);

	form.addEventListener("submit", async (event) =>
	{
		event.preventDefault();

		const response = await apiRequest(
		{
			schema: updateGameSchema,
			requestBody:
			{
				id: gameId,
				updateData:
				{
					notes: getChangedInputStringValueNullable(notesTextArea),
				},
			},
		}).getResponse();

		if (!response.success)
		{
			for (const error of response.errors)
			{
				notyf.error(error.message);
			}

			return console.error("[GameNotesDialog] Failed to update game:", response.errors);
		}

		dialog.close();

		reloadView();

		notyf.success("Game notes updated successfully.");
	});

	dialog.addEventListener("close", () => dialog.remove());

	dialog.classList.add("initialised");
}

async function initialiseOpenButton(button: HTMLButtonElement)
{
	const dialogContainer = getElementOrThrow(document, ".dialog-container");

	const gameId = getIntegerDataOrThrow(button, "gameId");

	button.addEventListener("click", async () =>
	{
		const response = await apiRequest(
		{
			schema: findGameSchema,
			requestBody:
			{
				id: gameId,
			},
		}).getResponse();

		if (!response.success)
		{
			for (const error of response.errors)
			{
				notyf.error(error.message);
			}

			return console.error("[GameNotesDialog] Failed to find game:", response.errors);
		}

		const dialog = GameNotesDialog(response.game).renderToHTMLElement() as HTMLDialogElement;

		dialogContainer.appendChild(dialog);

		document.dispatchEvent(new CustomEvent("lggl:reinitialise"));

		dialog.showModal();
	});

	button.classList.add("initialised");
}

//
// Component
//

export async function initialiseGameNotesDialogs()
{
	const dialogs = document.querySelectorAll<HTMLDialogElement>(
		".component-game-notes-dialog:not(.initialised)"
	);

	for (const dialog of dialogs)
	{
		initialise(dialog)
			.then(() => console.log("[GameNotesDialog] Initialised:", dialog))
			.catch((error) =>
				console.error("[GameNotesDialog] Error initialising:", dialog, error));
	}
}

export async function initialiseOpenGameNotesDialogButtons()
{
	const buttons = document.querySelectorAll<HTMLButtonElement>(
		`[data-open-game-notes-dialog="true"]:not(.initialised)`,
	);

	for (const button of buttons)
	{
		initialiseOpenButton(button)
			.then(() => console.log("[GameNotesDialog] Initialised open button:", button))
			.catch((error) =>
				console.error("[GameNotesDialog] Error initialising open button:", button, error));
	}
}