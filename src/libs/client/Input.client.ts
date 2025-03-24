//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";
import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";

import { notyf } from "../../instances/notyf.js";

//
// Utility Functions
//

export function getBooleanValue(input: HTMLInputElement)
{
	return input.checked;
}

export function getDateValue(input: HTMLInputElement)
{
	return input.value.trim();
}

export function getDateValueNullable(input: HTMLInputElement)
{
	return input.value.trim() != "" ? input.value.trim() : null;
}

export function getDateTimeValue(input: HTMLInputElement)
{
	return input.value.trim();
}

export function getDateTimeValueNullable(input: HTMLInputElement)
{
	return input.value.trim() != "" ? input.value.trim() : null;
}

export function getNumberValue(input: HTMLInputElement | HTMLSelectElement)
{
	return Number(input.value);
}

export function getNumberValueNullable(input: HTMLInputElement)
{
	return input.value.trim() != "" ? Number(input.value) : null;
}

export function getEnumValue<T>(input: HTMLSelectElement)
{
	return input.value as T;
}

export function getEnumValueNullable<T>(input: HTMLSelectElement)
{
	return input.value != "" ? input.value as T : null;
}

export function getStringValue(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
{
	return input.value.trim();
}

export function getStringValueNullable(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
{
	return input.value.trim() != "" ? input.value.trim() : null;
}

export function isInputDirty(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
{
	return BrowserUtilities.ElementClientLib.getBooleanData(input, "dirty") ?? false;
}

export function getChangedBooleanValue(input: HTMLInputElement)
{
	return isInputDirty(input) ? input.checked : undefined;
}

export function getChangedDateValue(input: HTMLInputElement)
{
	return isInputDirty(input) ? input.value.trim() : undefined;
}

export function getChangedDateValueNullable(input: HTMLInputElement)
{
	if (!isInputDirty(input))
	{
		return undefined;
	}

	return input.value.trim() != "" ? input.value.trim() : null;
}

export function getChangedDateTimeValue(input: HTMLInputElement)
{
	return isInputDirty(input) ? input.value.trim() : undefined;
}

export function getChangedDateTimeValueNullable(input: HTMLInputElement)
{
	if (!isInputDirty(input))
	{
		return undefined;
	}

	return input.value.trim() != "" ? input.value.trim() : null;
}

export function getChangedEnumValue<T>(input: HTMLSelectElement)
{
	return isInputDirty(input) ? input.value as T : undefined;
}

export function getChangedEnumValueNullable<T>(input: HTMLSelectElement)
{
	if (!isInputDirty(input))
	{
		return undefined;
	}

	return input.value.trim() != "" ? input.value as T : null;
}

export function getChangedNumberValue(input: HTMLInputElement | HTMLSelectElement)
{
	return isInputDirty(input) ? Number(input.value) : undefined;
}

export function getChangedNumberValueNullable(input: HTMLInputElement | HTMLSelectElement)
{
	if (!isInputDirty(input))
	{
		return undefined;
	}

	return input.value.trim() != "" ? Number(input.value) : null;
}

export function getChangedStringValue(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
{
	return isInputDirty(input) ? input.value.trim() : undefined;
}

export function getChangedStringValueNullable(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
{
	if (!isInputDirty(input))
	{
		return undefined;
	}

	return input.value.trim() != "" ? input.value.trim() : null;
}

export function clearDirtyInputs(form: HTMLFormElement)
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

export function disableInputs(form: HTMLFormElement)
{
	const inputs = form.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("button, input, select, textarea");

	for (const input of inputs)
	{
		input.disabled = true;
	}
}

export function enableInputs(form: HTMLFormElement)
{
	const inputs = form.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("button, input, select, textarea");

	for (const input of inputs)
	{
		input.disabled = false;
	}
}

type InitialiseFormOptions<T extends FritterApiUtilities.ResponseBody> =
{
	form: HTMLFormElement;
	submitter: HTMLButtonElement | HTMLFormElement | HTMLInputElement | HTMLSelectElement;
	requireConfirmation: boolean;
	onSubmit: () => Promise<T>;
	onSuccess: (successResponse: Extract<T, { success: true }>) => Promise<void>;
};

export function initialiseForm<T extends FritterApiUtilities.ResponseBody>(options: InitialiseFormOptions<T>)
{
	let eventName: string;

	if (options.submitter instanceof HTMLButtonElement)
	{
		eventName = "click";
	}
	else if (options.submitter instanceof HTMLFormElement)
	{
		eventName = "submit";
	}
	else
	{
		eventName = "change";
	}

	options.submitter.addEventListener(eventName,
		async (event) =>
		{
			event.preventDefault();

			try
			{
				disableInputs(options.form);

				// TODO: require confirmation

				const response = await options.onSubmit();

				if (!response.success)
				{
					for (const error of response.errors)
					{
						notyf.error(error);
					}

					console.error("[FormClientLib] Error response:", response);

					enableInputs(options.form);

					return;
				}

				notyf.success("Saved successfully.");

				// HACK: I hate that this cast is seemingly necessary
				await options.onSuccess(response as Extract<T, { success: true }>);
			}
			catch (error)
			{
				notyf.error("Error submitting form. See console for details.");

				console.error("[FormClientLib] Error submitting form:", error);
			}
		});
}