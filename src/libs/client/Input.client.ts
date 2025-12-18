//
// Imports
//

import { getBooleanData } from "@lorenstuff/browser-utilities";

import { notyf } from "../../instances/notyf.js";

import { ResponseBody } from "../Api.client.js";

//
// Utility Functions
//

export function isInputDirty(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
{
	return getBooleanData(input, "changed") ?? false;
}

export function clearDirtyInputs(form: HTMLFormElement)
{
	const inputs = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
		"input, select, textarea",
	);

	for (const input of inputs)
	{
		if (input instanceof HTMLInputElement && input.type == "checkbox")
		{
			input.dataset["changed"] = "false";
			input.dataset["initialValue"] = input.checked.toString();
		}
		else
		{
			input.dataset["changed"] = "false";
			input.dataset["initialValue"] = input.value;
		}
	}
}

export function disableInputs(form: HTMLFormElement)
{
	const inputs = form.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
		"button, input, select, textarea",
	);

	for (const input of inputs)
	{
		input.disabled = true;
	}
}

export function enableInputs(form: HTMLFormElement)
{
	const inputs = form.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
		"button, input, select, textarea",
	);

	for (const input of inputs)
	{
		input.disabled = false;
	}
}

type InitialiseFormOptions<T extends ResponseBody> =
{
	form: HTMLFormElement;
	submitter: HTMLButtonElement | HTMLFormElement | HTMLInputElement | HTMLSelectElement;
	requireConfirmation: boolean;
	onSubmit: () => Promise<T>;
	onSuccess: (successResponse: Extract<T, { success: true }>) => Promise<void>;
};

export function initialiseForm<T extends ResponseBody>(options: InitialiseFormOptions<T>)
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

	options.submitter.addEventListener(eventName, async (event) =>
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