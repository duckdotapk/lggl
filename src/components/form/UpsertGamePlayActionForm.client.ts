//
// Imports
//

import
{
	getChangedInputBooleanValue,
	getChangedInputEnumValue,
	getChangedInputStringValue,
	getChangedInputStringValueNullable,
	getElementOrThrow,
	getInputBooleanValue,
	getInputEnumValue,
	getInputStringValue,
	getInputStringValueNullable,
	getIntegerData,
	getIntegerDataOrThrow,
} from "@lorenstuff/browser-utilities";

import { initialiseForm } from "../../libs/client/Input.client.js";
import { reloadView } from "../../libs/client/Pjax.client.js";

import { GamePlayActionTypeSchema } from "../../libs/models/GamePlayAction.schemas.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as createGamePlayActionSchema from "../../routes/api/gamePlayAction/create.schemas.js";
import * as deleteGamePlayActionSchema from "../../routes/api/gamePlayAction/delete.schemas.js";
import * as updateGamePlayActionSchema from "../../routes/api/gamePlayAction/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = getIntegerDataOrThrow(form, "gameId");
	const gamePlayActionId = getIntegerData(form, "gamePlayActionId");

	const nameInput = getElementOrThrow<HTMLInputElement>(form, `[name="name"]`);
	const typeSelect = getElementOrThrow<HTMLSelectElement>(form, `[name="type"]`);
	const pathInput = getElementOrThrow<HTMLInputElement>(form, `[name="path"]`);
	const workingDirectoryInput = getElementOrThrow<HTMLInputElement>(
		form,
		`[name="workingDirectory"]`,
	);
	const additionalArgumentsTextArea = getElementOrThrow<HTMLTextAreaElement>(
		form,
		`[name="additionalArguments"]`,
	);
	const processRequirementsTextArea = getElementOrThrow<HTMLTextAreaElement>(
		form,
		`[name="processRequirements"]`,
	);
	const isArchivedInput = getElementOrThrow<HTMLInputElement>(form, `[name="isArchived"]`);

	if (gamePlayActionId == null)
	{
		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: createGamePlayActionSchema,
				requestBody:
				{
					game_id: gameId,

					name: getInputStringValue(nameInput),
					type: getInputEnumValue(typeSelect, GamePlayActionTypeSchema),
					path: getInputStringValue(pathInput),
					workingDirectory: getInputStringValueNullable(workingDirectoryInput),
					additionalArguments: getInputStringValueNullable(additionalArgumentsTextArea),
					processRequirements: getInputStringValueNullable(processRequirementsTextArea),
					isArchived: getInputBooleanValue(isArchivedInput),
				},
			}).getResponse(),
			onSuccess: async () => reloadView(),
		});
	}
	else
	{
		const deleteButton = getElementOrThrow<HTMLButtonElement>(form, `[data-action="delete"]`);

		initialiseForm(
		{
			form,
			submitter: deleteButton,
			requireConfirmation: true,
			onSubmit: async () => await apiRequest(
			{
				schema: deleteGamePlayActionSchema,
				requestBody:
				{
					id: gamePlayActionId,
				},
			}).getResponse(),
			onSuccess: async () => reloadView(),
		});

		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: updateGamePlayActionSchema,
				requestBody:
				{
					id: gamePlayActionId,
					updateData:
					{
						name: getChangedInputStringValue(nameInput),
						type: getChangedInputEnumValue(typeSelect, GamePlayActionTypeSchema),
						path: getChangedInputStringValue(pathInput),
						workingDirectory: getChangedInputStringValueNullable(workingDirectoryInput),
						additionalArguments: getChangedInputStringValueNullable(
							additionalArgumentsTextArea,
						),
						processRequirements: getChangedInputStringValueNullable(
							processRequirementsTextArea,
						),
						isArchived: getChangedInputBooleanValue(isArchivedInput),
					},
				},
			}).getResponse(),
			onSuccess: async () => reloadView(),
		});
	}

	form.classList.add("initialised");
}

//
// Component
//

export async function initialiseUpsertGamePlayActionForms()
{
	const forms = document.querySelectorAll<HTMLFormElement>(
		".component-upsert-game-play-action-form:not(.initialised)",
	);

	for (const form of forms)
	{
		initialise(form)
			.then(() => console.log("[UpsertGamePlayActionForm] Initialised:", form))
			.catch((error) =>
				console.error("[UpsertGamePlayActionForm] Error initialising:", form, error));
	}
}