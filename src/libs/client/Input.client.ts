//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";
import { ZodTypeAny } from "zod";

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

export function getNumberValue(input: HTMLInputElement)
{
	return Number(input.value);
}

export function getNumberValueNullable(input: HTMLInputElement)
{
	return input.value.trim() != "" ? Number(input.value) : null;
}

export function getEnumValue<T extends ZodTypeAny>(input: HTMLSelectElement, schema: T)
{
	return schema.parse(input.value);
}

export function getEnumValueNullable<T extends ZodTypeAny>(input: HTMLSelectElement, schema: T)
{
	return input.value.trim() != "" ? schema.parse(input.value.trim()) : null;
}

export function getStringValue(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
{
	return input.value;
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

export function getChangedEnumValue<T extends ZodTypeAny>(input: HTMLSelectElement, schema: T)
{
	return isInputDirty(input) ? schema.parse(input.value.trim()) : undefined;
}

export function getChangedEnumValueNullable<T extends ZodTypeAny>(input: HTMLSelectElement, schema: T)
{
	if (!isInputDirty(input))
	{
		return undefined;
	}

	return input.value.trim() != "" ? schema.parse(input.value.trim()) : null;
}

export function getChangedNumberValue(input: HTMLInputElement)
{
	return isInputDirty(input) ? Number(input.value) : undefined;
}

export function getChangedNumberValueNullable(input: HTMLInputElement)
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