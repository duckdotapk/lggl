//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";

import { createGameInstallation } from "../../routes/api/gameInstallation/create.schemas.js";
import { deleteGameInstallation } from "../../routes/api/gameInstallation/delete.schemas.js";
import { updateGameInstallation } from "../../routes/api/gameInstallation/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(form, "gameId");
	const gameInstallationId = BrowserUtilities.ElementClientLib.getIntegerData(form, "gameInstallationId");

	const pathInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="path"]`);

	const deleteButton = BrowserUtilities.ElementClientLib.getElement<HTMLButtonElement>(form, `[data-action="delete"]`);

	if (gameInstallationId == null)
	{
		form.addEventListener("submit",
			async (event) =>
			{
				event.preventDefault();

				try
				{
					InputClientLib.disableInputs(form);

					const response = await createGameInstallation(
						{
							game_id: gameId,
							path: InputClientLib.getStringValue(pathInput),
						});

					// TODO: show notifications on success/failure

					if (!response.success)
					{
						return console.error("[UpsertGameInstallationForm] Error creating GameInstallation:", response.errors);
					}

					// TODO: don't reload the page here
					window.location.reload();
				}
				catch (error)
				{
					console.error("[UpsertGameInstallationForm] Error creating GameInstallation:", error);
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
	
					const response = await deleteGameInstallation(gameInstallationId);
	
					// TODO: show notifications on success/failure
	
					if (!response.success)
					{
						return console.error("[UpsertGameInstallationForm] Error deleting GameInstallation:", response.errors);
					}
	
					form.remove();
				}
				catch (error)
				{
					console.error("[UpsertGameInstallationForm] Error deleting GameInstallation:", error);
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

					const response = await updateGameInstallation(gameInstallationId,
						{
							path: InputClientLib.getChangedStringValue(pathInput),
						});

					// TODO: show notifications on success/failure

					if (!response.success)
					{
						return console.error("[UpsertGameInstallationForm] Error updating GameInstallation:", response.errors);
					}

					InputClientLib.clearDirtyInputs(form);
				}
				catch (error)
				{
					console.error("[UpsertGameInstallationForm] Error updating GameInstallation:", error);
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

export async function initialiseUpsertGameInstallationForms()
{
	const upsertGameInstallationForms = document.querySelectorAll<HTMLFormElement>(".component-upsert-game-installation-form:not(.initialised)");

	for (const upsertGameInstallationForm of upsertGameInstallationForms)
	{
		try
		{
			await initialise(upsertGameInstallationForm);

			upsertGameInstallationForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[UpsertGameInstallationForm] Error initialising:", upsertGameInstallationForm, error);
		}
	}
}