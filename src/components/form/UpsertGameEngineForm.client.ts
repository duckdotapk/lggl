//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";

import { createGameEngine } from "../../routes/api/gameEngine/create.schemas.js";
import { deleteGameEngine } from "../../routes/api/gameEngine/delete.schemas.js";
import { updateGameEngine } from "../../routes/api/gameEngine/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(form, "gameId");
	const gameEngineId = BrowserUtilities.ElementClientLib.getIntegerData(form, "gameEngineId");

	const engineIdSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(form, `[name="engine_id"]`);
	const versionInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="version"]`);
	const notesInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="notes"]`);

	const deleteButton = BrowserUtilities.ElementClientLib.getElement<HTMLButtonElement>(form, `[data-action="delete"]`);

	if (gameEngineId == null)
	{
		form.addEventListener("submit",
			async (event) =>
			{
				event.preventDefault();

				try
				{
					InputClientLib.disableInputs(form);

					const response = await createGameEngine(
						{
							game_id: gameId,
							engine_id: InputClientLib.getNumberValue(engineIdSelect),
							version: InputClientLib.getStringValueNullable(versionInput),
							notes: InputClientLib.getStringValueNullable(notesInput),
						});

					// TODO: show notifications on success/failure

					if (!response.success)
					{
						return console.error("[UpsertGameEngineForm] Error creating GameEngine:", response.errors);
					}

					// TODO: don't reload the page here
					window.location.reload();
				}
				catch (error)
				{
					console.error("[UpsertGameEngineForm] Error creating GameEngine:", error);
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
	
					const response = await deleteGameEngine(gameEngineId);
	
					// TODO: show notifications on success/failure
	
					if (!response.success)
					{
						return console.error("[UpsertGameEngineForm] Error deleting GameEngine:", response.errors);
					}
	
					form.remove();
				}
				catch (error)
				{
					console.error("[UpsertGameEngineForm] Error deleting GameEngine:", error);
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

					const response = await updateGameEngine(gameEngineId,
						{
							engine_id: InputClientLib.getChangedNumberValue(engineIdSelect),
							version: InputClientLib.getChangedStringValueNullable(versionInput),
							notes: InputClientLib.getChangedStringValueNullable(notesInput),
						});

					// TODO: show notifications on success/failure

					if (!response.success)
					{
						return console.error("[UpsertGameEngineForm] Error updating GameEngine:", response.errors);
					}

					InputClientLib.clearDirtyInputs(form);
				}
				catch (error)
				{
					console.error("[UpsertGameEngineForm] Error updating GameEngine:", error);
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

export async function initialiseUpsertGameEngineForms()
{
	const upsertGameEngineForms = document.querySelectorAll<HTMLFormElement>(".component-upsert-game-engine-form:not(.initialised)");

	for (const upsertGameEngineForm of upsertGameEngineForms)
	{
		try
		{
			await initialise(upsertGameEngineForm);

			upsertGameEngineForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[UpsertGameEngineForm] Error initialising:", upsertGameEngineForm, error);
		}
	}
}