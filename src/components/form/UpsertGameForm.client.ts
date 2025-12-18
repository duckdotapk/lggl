//
// Imports
//

import
{
	getChangedInputBooleanValue,
	getChangedInputDateTimeValueNullable,
	getChangedInputDateValueNullable,
	getChangedInputEnumValueNullable,
	getChangedInputNumberValue,
	getChangedInputNumberValueNullable,
	getChangedInputStringValue,
	getChangedInputStringValueNullable,
	getElementOrThrow,
	getInputBooleanValue,
	getInputDateTimeValueNullable,
	getInputDateValueNullable,
	getInputEnumValueNullable,
	getInputNumberValueNullable,
	getInputStringValue,
	getInputStringValueNullable,
	getIntegerData,
} from "@lorenstuff/browser-utilities";

import
{
	GameAchievementSupportSchema,
	GameCompletionStatusSchema,
	GameControllerSupportSchema,
	GameLogoImageAlignmentSchema,
	GameLogoImageJustificationSchema,
	GameModSupportSchema,
	GameProgressionTypeSchema,
	GameSteamDeckCompatibilitySchema,
	GameVirtualRealitySupportSchema,
} from "../../libs/models/Game.schemas.js";

import { initialiseForm } from "../../libs/client/Input.client.js";
import { changeView, reloadView } from "../../libs/client/Pjax.client.js";

import { apiRequest } from "../../libs/Api.client.js";

import * as createGameSchema from "../../routes/api/game/create.schemas.js";
import * as updateGameSchema from "../../routes/api/game/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = getIntegerData(form, `gameId`);

	const nameInput = getElementOrThrow<HTMLInputElement>(form, `[name="name"]`);
	const sortNameInput = getElementOrThrow<HTMLInputElement>(form, `[name="sortName"]`);
	const releaseDateInput = getElementOrThrow<HTMLInputElement>(form, `[name="releaseDate"]`);
	const progressionTypeSelect = getElementOrThrow<HTMLSelectElement>(form, `[name="progressionType"]`);
	const descriptionInput = getElementOrThrow<HTMLInputElement>(form, `[name="description"]`);
	const notesInput = getElementOrThrow<HTMLInputElement>(form, `[name="notes"]`);

	const hasBannerImageInput = getElementOrThrow<HTMLInputElement>(form, `[name="hasBannerImage"]`);
	const hasCoverImageInput = getElementOrThrow<HTMLInputElement>(form, `[name="hasCoverImage"]`);
	const hasIconImageInput = getElementOrThrow<HTMLInputElement>(form, `[name="hasIconImage"]`);
	const hasLogoImageInput = getElementOrThrow<HTMLInputElement>(form, `[name="hasLogoImage"]`);
	const logoImageAlignmentSelect = getElementOrThrow<HTMLSelectElement>(form, `[name="logoImageAlignment"]`);
	const logoImageJustificationSelect = getElementOrThrow<HTMLSelectElement>(form, `[name="logoImageJustification"]`);

	const isEarlyAccessInput = getElementOrThrow<HTMLInputElement>(form, `[name="isEarlyAccess"]`);
	const isFamilySharedInput = getElementOrThrow<HTMLInputElement>(form, `[name="isFamilyShared"]`);
	const isFavoriteInput = getElementOrThrow<HTMLInputElement>(form, `[name="isFavorite"]`);
	const isHiddenInput = getElementOrThrow<HTMLInputElement>(form, `[name="isHidden"]`);
	const isNsfwInput = getElementOrThrow<HTMLInputElement>(form, `[name="isNsfw"]`);
	const isShelvedInput = getElementOrThrow<HTMLInputElement>(form, `[name="isShelved"]`);
	const isUnknownEngineInput = getElementOrThrow<HTMLInputElement>(form, `[name="isUnknownEngine"]`);
	const isUnreleasedInput = getElementOrThrow<HTMLInputElement>(form, `[name="isUnreleased"]`);

	const purchaseDateInput = getElementOrThrow<HTMLInputElement>(form, `[name="purchaseDate"]`);
	const completionStatusSelect = getElementOrThrow<HTMLSelectElement>(form, `[name="completionStatus"]`);
	const firstPlayedDateInput = getElementOrThrow<HTMLInputElement>(form, `[name="firstPlayedDate"]`);
	const firstPlayedDateApproximatedInput = getElementOrThrow<HTMLInputElement>(form, `[name="firstPlayedDateApproximated"]`);
	const firstCompletedDateInput = getElementOrThrow<HTMLInputElement>(form, `[name="firstCompletedDate"]`);
	const firstCompletedDateApproximatedInput = getElementOrThrow<HTMLInputElement>(form, `[name="firstCompletedDateApproximated"]`);
	const lastPlayedDateInput = getElementOrThrow<HTMLInputElement>(form, `[name="lastPlayedDate"]`);
	const playCountInput = getElementOrThrow<HTMLInputElement>(form, `[name="playCount"]`);
	const playTimeTotalSecondsInput = getElementOrThrow<HTMLInputElement>(form, `[name="playTimeTotalSeconds"]`);

	const achievementSupportSelect = getElementOrThrow<HTMLSelectElement>(form, `[name="achievementSupport"]`);
	const controllerSupportSelect = getElementOrThrow<HTMLSelectElement>(form, `[name="controllerSupport"]`);
	const modSupportSelect = getElementOrThrow<HTMLSelectElement>(form, `[name="modSupport"]`);
	const virtualRealitySupportSelect = getElementOrThrow<HTMLSelectElement>(form, `[name="virtualRealitySupport"]`);

	const steamAppIdInput = getElementOrThrow<HTMLInputElement>(form, `[name="steamAppId"]`);
	const steamAppNameInput = getElementOrThrow<HTMLInputElement>(form, `[name="steamAppName"]`);
	const steamDeckCompatibilitySelect = getElementOrThrow<HTMLSelectElement>(form, `[name="steamDeckCompatibility"]`);

	form.addEventListener("submit", (event) => event.preventDefault());

	if (gameId == null)
	{
		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: createGameSchema,
				requestBody:
				{
					name: getInputStringValue(nameInput),
					sortName: getInputStringValue(sortNameInput),
					releaseDate: getInputDateValueNullable(releaseDateInput)?.toISO() ?? null,
					description: getInputStringValueNullable(descriptionInput),
					notes: getInputStringValueNullable(notesInput),
					progressionType: getInputEnumValueNullable(
						progressionTypeSelect,
						GameProgressionTypeSchema,
					),

					hasBannerImage: getInputBooleanValue(hasBannerImageInput),
					hasCoverImage: getInputBooleanValue(hasCoverImageInput),
					hasIconImage: getInputBooleanValue(hasIconImageInput),
					hasLogoImage: getInputBooleanValue(hasLogoImageInput),
					logoImageAlignment: getInputEnumValueNullable(
						logoImageAlignmentSelect,
						GameLogoImageAlignmentSchema,
					),
					logoImageJustification: getInputEnumValueNullable(
						logoImageJustificationSelect,
						GameLogoImageJustificationSchema,
					),

					isEarlyAccess: getInputBooleanValue(isEarlyAccessInput),
					isFamilyShared: getInputBooleanValue(isFamilySharedInput),
					isFavorite: getInputBooleanValue(isFavoriteInput),
					isHidden: getInputBooleanValue(isHiddenInput),
					isNsfw: getInputBooleanValue(isNsfwInput),
					isShelved: getInputBooleanValue(isShelvedInput),
					isUnknownEngine: getInputBooleanValue(isUnknownEngineInput),
					isUnreleased: getInputBooleanValue(isUnreleasedInput),

					purchaseDate: getInputDateValueNullable(purchaseDateInput)?.toISO() ?? null,
					completionStatus: getInputEnumValueNullable(
						completionStatusSelect,
						GameCompletionStatusSchema,
					),
					firstPlayedDate: getInputDateTimeValueNullable(
						firstPlayedDateInput,
					)?.toISO() ?? null,
					firstPlayedDateApproximated: getInputBooleanValue(
						firstPlayedDateApproximatedInput,
					),
					firstCompletedDate: getInputDateTimeValueNullable(
						firstCompletedDateInput,
					)?.toISO() ?? null,
					firstCompletedDateApproximated: getInputBooleanValue(
						firstCompletedDateApproximatedInput,
					),
					lastPlayedDate: getInputDateTimeValueNullable(
						lastPlayedDateInput,
					)?.toISO() ?? null,
					playCount: getInputNumberValueNullable(playCountInput),
					playTimeTotalSeconds: getInputNumberValueNullable(playTimeTotalSecondsInput),

					achievementSupport: getInputEnumValueNullable(
						achievementSupportSelect,
						GameAchievementSupportSchema,
					),
					controllerSupport: getInputEnumValueNullable(
						controllerSupportSelect,
						GameControllerSupportSchema,
					),
					modSupport: getInputEnumValueNullable(
						modSupportSelect,
						GameModSupportSchema,
					),
					virtualRealitySupport: getInputEnumValueNullable(
						virtualRealitySupportSelect,
						GameVirtualRealitySupportSchema,
					),

					steamAppId: getInputNumberValueNullable(steamAppIdInput),
					steamAppName: getInputStringValueNullable(steamAppNameInput),
					steamDeckCompatibility: getInputEnumValueNullable(
						steamDeckCompatibilitySelect,
						GameSteamDeckCompatibilitySchema,
					),
				},
			}).getResponse(),
			onSuccess: async (response) => changeView("/games/edit/" + response.game.id),
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
			onSubmit: async () => { throw new Error("Not implemented.") }, // TODO: this
			onSuccess: async () => changeView("/games"),
		});

		initialiseForm(
		{
			form,
			submitter: form,
			requireConfirmation: false,
			onSubmit: async () => await apiRequest(
			{
				schema: updateGameSchema,
				requestBody:
				{
					id: gameId,
					updateData:
					{
						name: getChangedInputStringValue(nameInput),
						sortName: getChangedInputStringValue(sortNameInput),
						releaseDate: getChangedInputDateValueNullable(releaseDateInput)?.toISO(),
						description: getChangedInputStringValueNullable(descriptionInput),
						notes: getChangedInputStringValueNullable(notesInput),
						progressionType: getChangedInputEnumValueNullable(
							progressionTypeSelect, GameProgressionTypeSchema,
						),

						hasBannerImage: getChangedInputBooleanValue(hasBannerImageInput),
						hasCoverImage: getChangedInputBooleanValue(hasCoverImageInput),
						hasIconImage: getChangedInputBooleanValue(hasIconImageInput),
						hasLogoImage: getChangedInputBooleanValue(hasLogoImageInput),
						logoImageAlignment: getChangedInputEnumValueNullable(
							logoImageAlignmentSelect,
							GameLogoImageAlignmentSchema,
						),
						logoImageJustification: getChangedInputEnumValueNullable(
							logoImageJustificationSelect,
							GameLogoImageJustificationSchema,
						),

						isEarlyAccess: getChangedInputBooleanValue(isEarlyAccessInput),
						isFamilyShared: getChangedInputBooleanValue(isFamilySharedInput),
						isFavorite: getChangedInputBooleanValue(isFavoriteInput),
						isHidden: getChangedInputBooleanValue(isHiddenInput),
						isNsfw: getChangedInputBooleanValue(isNsfwInput),
						isShelved: getChangedInputBooleanValue(isShelvedInput),
						isUnknownEngine: getChangedInputBooleanValue(isUnknownEngineInput),
						isUnreleased: getChangedInputBooleanValue(isUnreleasedInput),

						purchaseDate: getChangedInputDateValueNullable(purchaseDateInput)?.toISO(),
						completionStatus: getChangedInputEnumValueNullable(
							completionStatusSelect,
							GameCompletionStatusSchema,
						),
						firstPlayedDate: getChangedInputDateTimeValueNullable(
							firstPlayedDateInput,
						)?.toISO(),
						firstPlayedDateApproximated: getChangedInputBooleanValue(
							firstPlayedDateApproximatedInput,
						),
						firstCompletedDate: getChangedInputDateTimeValueNullable(
							firstCompletedDateInput,
						)?.toISO(),
						firstCompletedDateApproximated: getChangedInputBooleanValue(
							firstCompletedDateApproximatedInput,
						),
						lastPlayedDate: getChangedInputDateTimeValueNullable(
							lastPlayedDateInput,
						)?.toISO(),
						playCount: getChangedInputNumberValue(playCountInput),
						playTimeTotalSeconds: getChangedInputNumberValue(playTimeTotalSecondsInput),

						achievementSupport: getChangedInputEnumValueNullable(
							achievementSupportSelect,
							GameAchievementSupportSchema,
						),
						controllerSupport: getChangedInputEnumValueNullable(
							controllerSupportSelect,
							GameControllerSupportSchema,
						),
						modSupport: getChangedInputEnumValueNullable(
							modSupportSelect,
							GameModSupportSchema,
						),
						virtualRealitySupport: getChangedInputEnumValueNullable(
							virtualRealitySupportSelect,
							GameVirtualRealitySupportSchema,
						),

						steamAppId: getChangedInputNumberValueNullable(steamAppIdInput),
						steamAppName: getChangedInputStringValueNullable(steamAppNameInput),
						steamDeckCompatibility: getChangedInputEnumValueNullable(
							steamDeckCompatibilitySelect,
							GameSteamDeckCompatibilitySchema,
						),
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

export async function initialiseUpsertGameForms()
{
	const forms = document.querySelectorAll<HTMLFormElement>(
		".component-upsert-game-form:not(.initialised)",
	);

	for (const form of forms)
	{
		initialise(form)
			.then(() => console.log("[UpsertGameForm] Initialised:", form))
			.catch((error) => console.error("[UpsertGameForm] Error initialising:", form, error));
	}
}