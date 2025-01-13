//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";

import * as GamePlayActionSchemaLib from "../../libs/schemas/GamePlayAction.js";

import { createGamePlayAction } from "../../routes/api/gamePlayAction/create.schemas.js";
import { deleteGamePlayAction } from "../../routes/api/gamePlayAction/delete.schemas.js";
import { updateGamePlayAction } from "../../routes/api/gamePlayAction/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(form, "gameId");
	const gamePlayActionId = BrowserUtilities.ElementClientLib.getIntegerData(form, "gamePlayActionId");

	const nameInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="name"]`);
	const typeSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(form, `[name="type"]`);
	const pathInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="path"]`);
	const trackingPathInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="trackingPath"]`);
	const argumentsJsonTextArea = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLTextAreaElement>(form, `[name="argumentsJson"]`);
	const isArchivedInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="isArchived"]`);

	const deleteButton = BrowserUtilities.ElementClientLib.getElement<HTMLButtonElement>(form, `[data-action="delete"]`);

	if (gamePlayActionId == null)
	{
		form.addEventListener("submit",
			async (event) =>
			{
				event.preventDefault();

				try
				{
					InputClientLib.disableInputs(form);

					const response = await createGamePlayAction(
						{
							game_id: gameId,

							name: InputClientLib.getStringValue(nameInput),
							type: InputClientLib.getEnumValue(typeSelect, GamePlayActionSchemaLib.TypeSchema),
							path: InputClientLib.getStringValue(pathInput),
							trackingPath: InputClientLib.getStringValue(trackingPathInput),
							argumentsJson: InputClientLib.getStringValue(argumentsJsonTextArea),
							isArchived: InputClientLib.getBooleanValue(isArchivedInput),
						});

					// TODO: show notifications on success/failure

					if (!response.success)
					{
						return console.error("[UpsertGamePlayActionForm] Error creating GamePlayAction:", response.errors);
					}

					// TODO: don't reload the page here
					window.location.reload();
				}
				catch (error)
				{
					console.error("[UpsertGamePlayActionForm] Error creating GamePlayAction:", error);
				}
				finally
				{
	
					InputClientLib.enableInputs(form);
				}
			});
	}
	else
	{
		deleteButton?.addEventListener("click",
			async () =>
			{
				try
				{
					InputClientLib.disableInputs(form);
				
					// TODO: prompt for confirmation
	
					const response = await deleteGamePlayAction(gamePlayActionId);
	
					// TODO: show notifications on success/failure
	
					if (!response.success)
					{
						return console.error("[UpsertGamePlayActionForm] Error deleting GamePlayAction:", response.errors);
					}
	
					form.remove();
				}
				catch (error)
				{
					console.error("[UpsertGamePlayActionForm] Error deleting GamePlayAction:", error);
				}
				finally
				{
					InputClientLib.enableInputs(form);
				}
			});

		form.addEventListener("submit",
			async (event) =>
			{
				event.preventDefault();

				try
				{
					InputClientLib.disableInputs(form);

					const response = await updateGamePlayAction(gamePlayActionId,
						{
							name: InputClientLib.getChangedStringValue(nameInput),
							type: InputClientLib.getChangedEnumValue(typeSelect, GamePlayActionSchemaLib.TypeSchema),
							path: InputClientLib.getChangedStringValue(pathInput),
							trackingPath: InputClientLib.getChangedStringValue(trackingPathInput),
							argumentsJson: InputClientLib.getChangedStringValue(argumentsJsonTextArea),
							isArchived: InputClientLib.getChangedBooleanValue(isArchivedInput),
						});

					// TODO: show notifications on success/failure

					if (!response.success)
					{
						return console.error("[UpsertGamePlayActionForm] Error updating GamePlayAction:", response.errors);
					}

					InputClientLib.clearDirtyInputs(form);
				}
				catch (error)
				{
					console.error("[UpsertGamePlayActionForm] Error updating GamePlayAction:", error);
				}
				finally
				{
					InputClientLib.enableInputs(form);
				}
			});
	}
}

//
// Component
//

export async function initialiseUpsertGamePlayActionForms()
{
	const upsertGamePlayActionForms = document.querySelectorAll<HTMLFormElement>(".component-upsert-game-play-action-form:not(.initialised)");

	for (const upsertGamePlayActionForm of upsertGamePlayActionForms)
	{
		try
		{
			await initialise(upsertGamePlayActionForm);

			upsertGamePlayActionForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[UpsertGamePlayActionForm] Error initialising:", upsertGamePlayActionForm, error);
		}
	}
}