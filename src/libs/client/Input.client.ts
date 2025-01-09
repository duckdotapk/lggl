//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";
import { ZodTypeAny } from "zod";

//
// Utility Functions
//

export function isInputDirty(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
{
	return BrowserUtilities.ElementClientLib.getBooleanData(input, "dirty") ?? false;
}

export function getBooleanValue(input: HTMLInputElement)
{
	return isInputDirty(input) ? input.checked : undefined;
}

export function getDateValue(input: HTMLInputElement)
{
	return isInputDirty(input) ? input.value : undefined;
}

export function getDateValueNullable(input: HTMLInputElement)
{
	if (!isInputDirty(input))
	{
		return undefined;
	}

	return input.value != "" ? input.value : null;
}

export function getDateTimeValue(input: HTMLInputElement)
{
	return isInputDirty(input) ? input.value : undefined;
}

export function getDateTimeValueNullable(input: HTMLInputElement)
{
	if (!isInputDirty(input))
	{
		return undefined;
	}

	return input.value.trim().length > 0 ? input.value : null;
}

export function getEnumValue<T extends ZodTypeAny>(input: HTMLSelectElement, schema: T)
{
	return isInputDirty(input) ? schema.parse(input.value) : undefined;
}

export function getEnumValueNullable<T extends ZodTypeAny>(input: HTMLSelectElement, schema: T)
{
	if (!isInputDirty(input))
	{
		return undefined;
	}

	return input.value != "" ? schema.parse(input.value) : null;
}

export function getNumberValue(input: HTMLInputElement)
{
	return isInputDirty(input) ? Number(input.value) : undefined;
}

export function getNumberValueNullable(input: HTMLInputElement)
{
	if (!isInputDirty(input))
	{
		return undefined;
	}

	return input.value.trim() == "" ? null : Number(input.value);
}

export function getStringValue(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
{
	return isInputDirty(input) ? input.value : undefined;
}

export function getStringValueNullable(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
{
	if (!isInputDirty(input))
	{
		return undefined;
	}

	return input.value.trim().length > 0 ? input.value : null;
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