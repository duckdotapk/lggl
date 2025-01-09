//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";
import { ZodTypeAny } from "zod";

import { updateGame } from "../../routes/api/game/update.schemas.js";

import * as GameSchemaLib from "../../libs/schemas/Game.js";

//
// Locals
//

function isInputDirty(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
{
	return BrowserUtilities.ElementClientLib.getBooleanData(input, "dirty") ?? false;
}

function getBooleanValue(input: HTMLInputElement)
{
	return isInputDirty(input) ? input.checked : undefined;
}

function getDateValueNullable(input: HTMLInputElement)
{
	if (!isInputDirty(input))
	{
		return undefined;
	}

	return input.value != "" ? input.value : null;
}

function getDateTimeValueNullable(input: HTMLInputElement)
{
	if (!isInputDirty(input))
	{
		return undefined;
	}

	return input.value.trim().length > 0 ? input.value : null;
}

function getEnumValueNullable<T extends ZodTypeAny>(input: HTMLSelectElement, schema: T)
{
	if (!isInputDirty(input))
	{
		return undefined;
	}

	return input.value != "" ? schema.parse(input.value) : null;
}

function getNumberValue(input: HTMLInputElement)
{
	return isInputDirty(input) ? Number(input.value) : undefined;
}

function getNumberValueNullable(input: HTMLInputElement)
{
	if (!isInputDirty(input))
	{
		return undefined;
	}

	return input.value.trim() == "" ? null : Number(input.value);
}

function getStringValue(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
{
	return isInputDirty(input) ? input.value : undefined;
}

function getStringValueNullable(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
{
	if (!isInputDirty(input))
	{
		return undefined;
	}

	return input.value.trim().length > 0 ? input.value : null;
}

function clearDirtyInputs(form: HTMLFormElement)
{
	const inputs = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea");

	for (const input of inputs)
	{
		if (input instanceof HTMLInputElement && input.type == "checkbox")
		{
			input.dataset["dirty"] = "false";
			input.dataset["initialValue"] = input.checked.toString();
		}
		else
		{
			input.dataset["dirty"] = "false";
			input.dataset["initialValue"] = input.value;
		}
	}
}

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

					getDateValueNullable(releaseDateInput);

					const response = await updateGame(gameId,
						{
							name: getStringValue(nameInput),
							sortName: getStringValue(sortNameInput),
							releaseDate: getDateValueNullable(releaseDateInput),
							description: getStringValueNullable(descriptionInput),
							notes: getStringValueNullable(notesInput),
							progressionType: getEnumValueNullable(progressionTypeSelect, GameSchemaLib.ProgressionTypeSchema),

							hasBannerImage: getBooleanValue(hasBannerImageInput),
							hasCoverImage: getBooleanValue(hasCoverImageInput),
							hasIconImage: getBooleanValue(hasIconImageInput),
							hasLogoImage: getBooleanValue(hasLogoImageInput),

							isEarlyAccess: getBooleanValue(isEarlyAccessInput),
							isFavorite: getBooleanValue(isFavoriteInput),
							isHidden: getBooleanValue(isHiddenInput),
							isInstalled: getBooleanValue(isInstalledInput),
							isNsfw: getBooleanValue(isNsfwInput),
							isShelved: getBooleanValue(isShelvedInput),
							isUnknownEngine: getBooleanValue(isUnknownEngineInput),
							isUnreleased: getBooleanValue(isUnreleasedInput),

							completionStatus: getEnumValueNullable(completionStatusSelect, GameSchemaLib.CompletionStatusSchema),
							firstPlayedDate: getDateTimeValueNullable(firstPlayedDateInput),
							firstPlayedDateApproximated: getBooleanValue(firstPlayedDateApproximatedInput),
							firstCompletedDate: getDateTimeValueNullable(firstCompletedDateInput),
							firstCompletedDateApproximated: getBooleanValue(firstCompletedDateApproximatedInput),
							lastPlayedDate: getDateTimeValueNullable(lastPlayedDateInput),
							playCount: getNumberValue(playCountInput),
							playTimeTotalSeconds: getNumberValue(playTimeTotalSecondsInput),

							achievementSupport: getEnumValueNullable(achievementSupportSelect, GameSchemaLib.AchievementSupportSchema),
							controllerSupport: getEnumValueNullable(controllerSupportSelect, GameSchemaLib.ControllerSupportSchema),
							modSupport: getEnumValueNullable(modSupportSelect, GameSchemaLib.ModSupportSchema),
							virtualRealitySupport: getEnumValueNullable(virtualRealitySupportSelect, GameSchemaLib.VirtualRealitySupportSchema),

							steamAppId: getNumberValueNullable(steamAppIdInput),
							steamAppName: getStringValueNullable(steamAppNameInput),
						});

					if (!response.success)
					{
						// TODO: communicate error to user!
						console.error("[UpsertGameForm] Error updating game:", response.errors);

						return;
					}

					clearDirtyInputs(form);
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