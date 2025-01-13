//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import * as InputClientLib from "../../libs/client/Input.client.js";
import * as PjaxClientLib from "../../libs/client/Pjax.client.js";

import * as GameSchemaLib from "../../libs/schemas/Game.js";

import { createGame } from "../../routes/api/game/create.schemas.js";
import { updateGame } from "../../routes/api/game/update.schemas.js";

//
// Locals
//

async function initialise(form: HTMLFormElement)
{
	const gameId = BrowserUtilities.ElementClientLib.getIntegerData(form, `gameId`);

	const nameInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="name"]`);
	const sortNameInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="sortName"]`);
	const releaseDateInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="releaseDate"]`);
	const progressionTypeSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(form, `[name="progressionType"]`);
	const descriptionInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="description"]`);
	const notesInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="notes"]`);

	const hasBannerImageInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="hasBannerImage"]`);
	const hasCoverImageInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="hasCoverImage"]`);
	const hasIconImageInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="hasIconImage"]`);
	const hasLogoImageInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="hasLogoImage"]`);

	const isEarlyAccessInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="isEarlyAccess"]`);
	const isFavoriteInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="isFavorite"]`);
	const isHiddenInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="isHidden"]`);
	const isInstalledInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="isInstalled"]`);
	const isNsfwInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="isNsfw"]`);
	const isShelvedInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="isShelved"]`);
	const isUnknownEngineInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="isUnknownEngine"]`);
	const isUnreleasedInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="isUnreleased"]`);

	const completionStatusSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(form, `[name="completionStatus"]`);
	const firstPlayedDateInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="firstPlayedDate"]`);
	const firstPlayedDateApproximatedInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="firstPlayedDateApproximated"]`);
	const firstCompletedDateInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="firstCompletedDate"]`);
	const firstCompletedDateApproximatedInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="firstCompletedDateApproximated"]`);
	const lastPlayedDateInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="lastPlayedDate"]`);
	const playCountInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="playCount"]`);
	const playTimeTotalSecondsInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="playTimeTotalSeconds"]`);

	const achievementSupportSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(form, `[name="achievementSupport"]`);
	const controllerSupportSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(form, `[name="controllerSupport"]`);
	const modSupportSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(form, `[name="modSupport"]`);
	const virtualRealitySupportSelect = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLSelectElement>(form, `[name="virtualRealitySupport"]`);

	const steamAppIdInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="steamAppId"]`);
	const steamAppNameInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(form, `[name="steamAppName"]`);

	form.addEventListener("submit", (event) => event.preventDefault());

	if (gameId == null)
	{
		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await createGame(
					{
						name: InputClientLib.getStringValue(nameInput),
						sortName: InputClientLib.getStringValue(sortNameInput),
						releaseDate: InputClientLib.getDateValueNullable(releaseDateInput),
						description: InputClientLib.getStringValueNullable(descriptionInput),
						notes: InputClientLib.getStringValueNullable(notesInput),
						progressionType: InputClientLib.getEnumValueNullable(progressionTypeSelect, GameSchemaLib.ProgressionTypeSchema),

						hasBannerImage: InputClientLib.getBooleanValue(hasBannerImageInput),
						hasCoverImage: InputClientLib.getBooleanValue(hasCoverImageInput),
						hasIconImage: InputClientLib.getBooleanValue(hasIconImageInput),
						hasLogoImage: InputClientLib.getBooleanValue(hasLogoImageInput),

						isEarlyAccess: InputClientLib.getBooleanValue(isEarlyAccessInput),
						isFavorite: InputClientLib.getBooleanValue(isFavoriteInput),
						isHidden: InputClientLib.getBooleanValue(isHiddenInput),
						isInstalled: InputClientLib.getBooleanValue(isInstalledInput),
						isNsfw: InputClientLib.getBooleanValue(isNsfwInput),
						isShelved: InputClientLib.getBooleanValue(isShelvedInput),
						isUnknownEngine: InputClientLib.getBooleanValue(isUnknownEngineInput),
						isUnreleased: InputClientLib.getBooleanValue(isUnreleasedInput),

						completionStatus: InputClientLib.getEnumValueNullable(completionStatusSelect, GameSchemaLib.CompletionStatusSchema),
						firstPlayedDate: InputClientLib.getDateTimeValueNullable(firstPlayedDateInput),
						firstPlayedDateApproximated: InputClientLib.getBooleanValue(firstPlayedDateApproximatedInput),
						firstCompletedDate: InputClientLib.getDateTimeValueNullable(firstCompletedDateInput),
						firstCompletedDateApproximated: InputClientLib.getBooleanValue(firstCompletedDateApproximatedInput),
						lastPlayedDate: InputClientLib.getDateTimeValueNullable(lastPlayedDateInput),
						playCount: InputClientLib.getNumberValue(playCountInput),
						playTimeTotalSeconds: InputClientLib.getNumberValue(playTimeTotalSecondsInput),

						achievementSupport: InputClientLib.getEnumValueNullable(achievementSupportSelect, GameSchemaLib.AchievementSupportSchema),
						controllerSupport: InputClientLib.getEnumValueNullable(controllerSupportSelect, GameSchemaLib.ControllerSupportSchema),
						modSupport: InputClientLib.getEnumValueNullable(modSupportSelect, GameSchemaLib.ModSupportSchema),
						virtualRealitySupport: InputClientLib.getEnumValueNullable(virtualRealitySupportSelect, GameSchemaLib.VirtualRealitySupportSchema),

						steamAppId: InputClientLib.getNumberValueNullable(steamAppIdInput),
						steamAppName: InputClientLib.getStringValueNullable(steamAppNameInput),
					}),
				onSuccess: async (response) => PjaxClientLib.changeView("/games/view/" + response.game.id),
			}
		)
	}
	else
	{
		const deleteButton = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLButtonElement>(form, `[data-action="delete"]`);

		InputClientLib.initialiseForm(
			{
				form,
				submitter: deleteButton,
				requireConfirmation: true,
				onSubmit: async () => { throw new Error("Not implemented.") }, // TODO: this
				onSuccess: async () => PjaxClientLib.changeView("/games"),
			});

		InputClientLib.initialiseForm(
			{
				form,
				submitter: form,
				requireConfirmation: false,
				onSubmit: async () => await updateGame(gameId,
					{
						name: InputClientLib.getChangedStringValue(nameInput),
						sortName: InputClientLib.getChangedStringValue(sortNameInput),
						releaseDate: InputClientLib.getChangedDateValueNullable(releaseDateInput),
						description: InputClientLib.getChangedStringValueNullable(descriptionInput),
						notes: InputClientLib.getChangedStringValueNullable(notesInput),
						progressionType: InputClientLib.getChangedEnumValueNullable(progressionTypeSelect, GameSchemaLib.ProgressionTypeSchema),

						hasBannerImage: InputClientLib.getChangedBooleanValue(hasBannerImageInput),
						hasCoverImage: InputClientLib.getChangedBooleanValue(hasCoverImageInput),
						hasIconImage: InputClientLib.getChangedBooleanValue(hasIconImageInput),
						hasLogoImage: InputClientLib.getChangedBooleanValue(hasLogoImageInput),

						isEarlyAccess: InputClientLib.getChangedBooleanValue(isEarlyAccessInput),
						isFavorite: InputClientLib.getChangedBooleanValue(isFavoriteInput),
						isHidden: InputClientLib.getChangedBooleanValue(isHiddenInput),
						isInstalled: InputClientLib.getChangedBooleanValue(isInstalledInput),
						isNsfw: InputClientLib.getChangedBooleanValue(isNsfwInput),
						isShelved: InputClientLib.getChangedBooleanValue(isShelvedInput),
						isUnknownEngine: InputClientLib.getChangedBooleanValue(isUnknownEngineInput),
						isUnreleased: InputClientLib.getChangedBooleanValue(isUnreleasedInput),

						completionStatus: InputClientLib.getChangedEnumValueNullable(completionStatusSelect, GameSchemaLib.CompletionStatusSchema),
						firstPlayedDate: InputClientLib.getChangedDateTimeValueNullable(firstPlayedDateInput),
						firstPlayedDateApproximated: InputClientLib.getChangedBooleanValue(firstPlayedDateApproximatedInput),
						firstCompletedDate: InputClientLib.getChangedDateTimeValueNullable(firstCompletedDateInput),
						firstCompletedDateApproximated: InputClientLib.getChangedBooleanValue(firstCompletedDateApproximatedInput),
						lastPlayedDate: InputClientLib.getChangedDateTimeValueNullable(lastPlayedDateInput),
						playCount: InputClientLib.getChangedNumberValue(playCountInput),
						playTimeTotalSeconds: InputClientLib.getChangedNumberValue(playTimeTotalSecondsInput),

						achievementSupport: InputClientLib.getChangedEnumValueNullable(achievementSupportSelect, GameSchemaLib.AchievementSupportSchema),
						controllerSupport: InputClientLib.getChangedEnumValueNullable(controllerSupportSelect, GameSchemaLib.ControllerSupportSchema),
						modSupport: InputClientLib.getChangedEnumValueNullable(modSupportSelect, GameSchemaLib.ModSupportSchema),
						virtualRealitySupport: InputClientLib.getChangedEnumValueNullable(virtualRealitySupportSelect, GameSchemaLib.VirtualRealitySupportSchema),

						steamAppId: InputClientLib.getChangedNumberValueNullable(steamAppIdInput),
						steamAppName: InputClientLib.getChangedStringValueNullable(steamAppNameInput),
					}),
				onSuccess: async () => PjaxClientLib.reloadView(),
			});
	}
}

//
// Component
//

export async function initialiseUpsertGameForms()
{
	const upsertGameForms = document.querySelectorAll<HTMLFormElement>(".component-upsert-game-form:not(.initialised)");

	for (const upsertGameForm of upsertGameForms)
	{
		try
		{
			await initialise(upsertGameForm);

			upsertGameForm.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[UpsertGameForm] Error initialising:", upsertGameForm, error);
		}
	}
}