//
// Imports
//

import
{
	getElementOrThrow,
	getInputStringValue,
	getInputStringValueNullable,
	getIntegerData,
} from "@lorenstuff/browser-utilities";

import { initialiseForm } from "../../libs/client/Input.client.js";
import { changeView, reloadView } from "../../libs/client/Pjax.client.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as createEngineSchema from "../../routes/api/engine/create.schemas.js";
import * as deleteEngineSchema from "../../routes/api/engine/delete.schemas.js";
import * as updateEngineSchema from "../../routes/api/engine/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const engineId = getIntegerData(form, "engineId");

	const nameInput = getElementOrThrow<HTMLInputElement>(form, `[name="name"]`);
	const shortNameInput = getElementOrThrow<HTMLInputElement>(form, `[name="shortName"]`);

	if (engineId == null)
	{
		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: createEngineSchema,
				requestBody:
				{
					name: getInputStringValue(nameInput),
					shortName: getInputStringValueNullable(shortNameInput),
				},
			}).getResponse(),
			onSuccess: async (response) => changeView("/engines/edit/" + response.engine.id),
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
				schema: deleteEngineSchema,
				requestBody:
				{
					id: engineId,
				},
			}).getResponse(),
			onSuccess: async () => changeView("/engines"),
		});

		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: updateEngineSchema,
				requestBody:
				{
					id: engineId,
					updateData:
					{
						name: getInputStringValue(nameInput),
						shortName: getInputStringValueNullable(shortNameInput),
					},
				},
			}).getResponse(),
			onSuccess: async () => reloadView(),
		});
	}
}

//
// Component
//

export async function initialiseUpsertEngineForms()
{
	const forms = document.querySelectorAll<HTMLFormElement>(
		".component-upsert-engine-form:not(.initialised)",
	);

	for (const form of forms)
	{
		initialise(form)
			.then(() => console.log("[UpsertEngineForm] Initialised:", form))
			.catch((error) => console.error("[UpsertEngineForm] Error initialising:", form, error));
	}
}