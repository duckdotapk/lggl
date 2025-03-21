//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";
import { GamePlayActionType } from "@prisma/client";

import * as InputClientLib from "../../libs/client/Input.client.js";
import * as PjaxClientLib from "../../libs/client/Pjax.client.js";

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
	const workingDirectoryInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="workingDirectory"]`);
	const additionalArgumentsTextArea = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLTextAreaElement>(form, `[name="additionalArguments"]`);
	const processRequirementsTextArea = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLTextAreaElement>(form, `[name="processRequirements"]`);
	const isArchivedInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="isArchived"]`);

	if (gamePlayActionId == null)
	{
		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await createGamePlayAction(
					{
						game_id: gameId,

						name: InputClientLib.getStringValue(nameInput),
						type: InputClientLib.getEnumValue<GamePlayActionType>(typeSelect),
						path: InputClientLib.getStringValue(pathInput),
						workingDirectory: InputClientLib.getStringValueNullable(workingDirectoryInput),
						additionalArguments: InputClientLib.getStringValueNullable(additionalArgumentsTextArea),
						processRequirements: InputClientLib.getStringValueNullable(processRequirementsTextArea),
						isArchived: InputClientLib.getBooleanValue(isArchivedInput),
					}),
				onSuccess: async () => PjaxClientLib.reloadView(),
			});
	}
	else
	{
		const deleteButton = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLButtonElement>(form, `[data-action="delete"]`);

		InputClientLib.initialiseForm(
			{
				form,
				submitter: deleteButton,
				requireConfirmation: true,
				onSubmit: async () => await deleteGamePlayAction(gamePlayActionId),
				onSuccess: async () => PjaxClientLib.reloadView(),
			});

		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await updateGamePlayAction(gamePlayActionId,
					{
						name: InputClientLib.getChangedStringValue(nameInput),
						type: InputClientLib.getChangedEnumValue<GamePlayActionType>(typeSelect),
						path: InputClientLib.getChangedStringValue(pathInput),
						workingDirectory: InputClientLib.getChangedStringValueNullable(workingDirectoryInput),
						additionalArguments: InputClientLib.getChangedStringValueNullable(additionalArgumentsTextArea),
						processRequirements: InputClientLib.getChangedStringValueNullable(processRequirementsTextArea),
						isArchived: InputClientLib.getChangedBooleanValue(isArchivedInput),
					}),
				onSuccess: async () => PjaxClientLib.reloadView(),
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