//
// Imports
//

import { getElementOrThrow, getIntegerDataOrThrow } from "@lorenstuff/browser-utilities";

import { ChooseGamePlayActionDialog } from "./ChooseGamePlayActionDialog.js";

import { notyf } from "../../instances/notyf.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as executeGamePlayActionSchema from "../../routes/api/gamePlayAction/execute.schemas.js";
import * as findGamePlayActionsSchema from "../../routes/api/gamePlayAction/findAll.schemas.js";

//
// Locals
//

async function initialise(dialog: HTMLDialogElement)
{
	const buttons = dialog.querySelectorAll<HTMLButtonElement>(".component-button");

	for (const button of buttons)
	{
		const gamePlayActionId = getIntegerDataOrThrow(button, "gamePlayActionId");

		button.addEventListener("click", async () =>
		{
			dialog.close();

			const response = await apiRequest(
			{
				schema: executeGamePlayActionSchema,
				requestBody:
				{
					id: gamePlayActionId,
				},
			}).getResponse();

			if (!response.success)
			{
				for (const error of response.errors)
				{
					notyf.error(error.message);
				}

				console.error(
					"[ChooseGamePlayActionDialog] Failed to launch game:",
					response.errors,
				);
			}

			notyf.success("Game launched successfully.");
		});
	}

	dialog.addEventListener("close", () => dialog.remove());

	dialog.classList.add("initialised");
}

async function initialiseOpenButton(button: HTMLButtonElement)
{
	const dialogContainer = getElementOrThrow(document, ".dialog-container");

	const gameId = getIntegerDataOrThrow(button, "gameId");

	button.addEventListener("click", async () =>
	{
		const findGamePlayActionsResponse = await apiRequest(
		{
			schema: findGamePlayActionsSchema,
			requestBody:
			{
				game_id: gameId,
			},
		}).getResponse();

		if (!findGamePlayActionsResponse.success)
		{
			for (const error of findGamePlayActionsResponse.errors)
			{
				notyf.error(error.message);
			}

			console.error(
				"[ChooseGamePlayActionDialog] Failed to find game play actions:",
				findGamePlayActionsResponse.errors,
			);
			return;
		}

		if (findGamePlayActionsResponse.gamePlayActions.length == 0)
		{
			notyf.error("No game play actions found for this game.");

			console.error(
				"[ChooseGamePlayActionDialog] No game play actions found for game:",
				gameId,
			);
			return;
		}

		if (findGamePlayActionsResponse.gamePlayActions.length == 1)
		{
			const launchGameResponse = await apiRequest(
			{
				schema: executeGamePlayActionSchema,
				requestBody:
				{
					id: findGamePlayActionsResponse.gamePlayActions[0]!.id,
				},
			}).getResponse();

			if (!launchGameResponse.success)
			{
				for (const error of launchGameResponse.errors)
				{
					notyf.error(error.message);
				}

				console.error(
					"[ChooseGamePlayActionDialog] Failed to launch game:",
					launchGameResponse.errors,
				);
				return;
			}

			notyf.success("Game launched successfully.");

			return;
		}

		const dialog = ChooseGamePlayActionDialog(
			findGamePlayActionsResponse.gamePlayActions
		).renderToHTMLElement() as HTMLDialogElement;

		dialogContainer.appendChild(dialog);

		document.dispatchEvent(new CustomEvent("lggl:reinitialise"));

		dialog.showModal();
	});

	button.classList.add("initialised");
}

//
// Component
//

export async function initialiseChooseGamePlayActionDialogs()
{
	const dialogs = document.querySelectorAll<HTMLDialogElement>(
		".component-choose-game-play-action-dialog:not(.initialised)",
	);

	for (const dialog of dialogs)
	{
		initialise(dialog)
			.then(() => console.log("[ChooseGamePlayActionDialog] Initialised:", dialog))
			.catch((error) =>
				console.error("[ChooseGamePlayActionDialog] Error initialised:", dialog, error));
	}
}

export async function initialiseOpenChooseGamePlayActionDialogButtons()
{
	const buttons = document.querySelectorAll<HTMLButtonElement>(
		`[data-open-choose-game-play-action-dialog="true"]:not(.initialised)`,
	);

	for (const button of buttons)
	{
		initialiseOpenButton(button)
			.then(() => console.log(
				"[ChooseGamePlayActionDialog] Initialised open button:",
				button,
			))
			.catch((error) => console.error(
				"[ChooseGamePlayActionDialog] Error initialising open button:",
				button,
				error,
			));
	}
}