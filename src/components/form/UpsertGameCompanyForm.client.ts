//
// Imports
//

import
{
	getChangedInputEnumValue,
	getChangedInputNumberValue,
	getChangedInputStringValueNullable,
	getElementOrThrow,
	getInputEnumValue,
	getInputNumberValue,
	getInputStringValueNullable,
	getIntegerData,
	getIntegerDataOrThrow,
} from "@lorenstuff/browser-utilities";

import { initialiseForm } from "../../libs/client/Input.client.js";
import { reloadView } from "../../libs/client/Pjax.client.js";

import { GameCompanyTypeSchema } from "../../libs/models/GameCompany.schemas.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as createGameCompanySchema from "../../routes/api/gameCompany/create.schemas.js";
import * as deleteGameCompanySchema from "../../routes/api/gameCompany/delete.schemas.js";
import * as updateGameCompanySchema from "../../routes/api/gameCompany/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = getIntegerDataOrThrow(form, "gameId");
	const gameCompanyId = getIntegerData(form, "gameCompanyId");

	const companyIdSelect = getElementOrThrow<HTMLSelectElement>(form, `[name="company_id"]`);
	const typeSelect = getElementOrThrow<HTMLSelectElement>(form, `[name="type"]`);
	const notesInput = getElementOrThrow<HTMLInputElement>(form, `[name="notes"]`);

	if (gameCompanyId == null)
	{
		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: createGameCompanySchema,
				requestBody:
				{
					game_id: gameId,
					company_id: getInputNumberValue(companyIdSelect),
					type: getInputEnumValue(typeSelect, GameCompanyTypeSchema),
					notes: getInputStringValueNullable(notesInput),
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
				schema: deleteGameCompanySchema,
				requestBody:
				{
					id: gameCompanyId,
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
				schema: updateGameCompanySchema,
				requestBody:
				{
					id: gameCompanyId,
					updateData:
					{
						company_id: getChangedInputNumberValue(companyIdSelect),
						type: getChangedInputEnumValue(typeSelect, GameCompanyTypeSchema),
						notes: getChangedInputStringValueNullable(notesInput),
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

export async function initialiseUpsertGameCompanyForms()
{
	const forms = document.querySelectorAll<HTMLFormElement>(
		".component-upsert-game-company-form:not(.initialised)",
	);

	for (const form of forms)
	{
		initialise(form)
			.then(() => console.log("[UpsertGameCompanyForm] Initialised:", form))
			.catch((error) =>
				console.error("[UpsertGameCompanyForm] Error initialising:", form, error));
	}
}