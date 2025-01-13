//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";

import { createGamePlatform } from "../../routes/api/gamePlatform/create.schemas.js";
import { deleteGamePlatform } from "../../routes/api/gamePlatform/delete.schemas.js";
import { updateGamePlatform } from "../../routes/api/gamePlatform/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(form, "gameId");
	const gamePlatformId = BrowserUtilities.ElementClientLib.getIntegerData(form, "gamePlatformId");

	const platformIdSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(form, `[name="platform_id"]`);

	const deleteButton = BrowserUtilities.ElementClientLib.getElement<HTMLButtonElement>(form, `[data-action="delete"]`);

	if (gamePlatformId == null)
	{
		form.addEventListener("submit",
			async (event) =>
			{
				event.preventDefault();

				try
				{
					InputClientLib.disableInputs(form);

					const response = await createGamePlatform(
						{
							game_id: gameId,
							platform_id: InputClientLib.getNumberValue(platformIdSelect),
						});

					// TODO: show notifications on success/failure

					if (!response.success)
					{
						return console.error("[UpsertGamePlatformForm] Error creating GamePlatform:", response.errors);
					}

					// TODO: don't reload the page here
					window.location.reload();
				}
				catch (error)
				{
					console.error("[UpsertGamePlatformForm] Error creating GamePlatform:", error);
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
	
					const response = await deleteGamePlatform(gamePlatformId);
	
					// TODO: show notifications on success/failure
	
					if (!response.success)
					{
						return console.error("[UpsertGamePlatformForm] Error deleting GamePlatform:", response.errors);
					}
	
					form.remove();
				}
				catch (error)
				{
					console.error("[UpsertGamePlatformForm] Error deleting GamePlatform:", error);
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

					const response = await updateGamePlatform(gamePlatformId,
						{
							platform_id: InputClientLib.getChangedNumberValue(platformIdSelect),
						});

					// TODO: show notifications on success/failure

					if (!response.success)
					{
						return console.error("[UpsertGamePlatformForm] Error updating GamePlatform:", response.errors);
					}

					InputClientLib.clearDirtyInputs(form);
				}
				catch (error)
				{
					console.error("[UpsertGamePlatformForm] Error updating GamePlatform:", error);
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

export async function initialiseUpsertGamePlatformForms()
{
	const upsertGamePlatformForms = document.querySelectorAll<HTMLFormElement>(".component-upsert-game-platform-form:not(.initialised)");

	for (const upsertGamePlatformForm of upsertGamePlatformForms)
	{
		try
		{
			await initialise(upsertGamePlatformForm);

			upsertGamePlatformForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[UpsertGamePlatformForm] Error initialising:", upsertGamePlatformForm, error);
		}
	}
}