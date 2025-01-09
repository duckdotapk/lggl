//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

import { updateGame } from "../../routes/api/game/update.schemas.js";

import * as InputClientLib from "../../libs/client/Input.client.js";

import * as GameSchemaLib from "../../libs/schemas/Game.js";

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

	const saveButton = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLButtonElement>(form, `[type="submit"]`);

	if (gameId == null)
	{
		// TODO: implement creating a *new* game
	}
	else
	{
		form.addEventListener("submit",
			async (event) =>
			{
				event.preventDefault();

				try
				{
					saveButton.disabled = true;

					const response = await updateGame(gameId,
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
						});

					if (!response.success)
					{
						// TODO: communicate error to user!
						console.error("[UpsertGameForm] Error updating game:", response.errors);

						return;
					}

					InputClientLib.clearDirtyInputs(form);
				}
				finally
				{
					saveButton.disabled = false;
				}
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