//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

//
// Locals
//

async function initialise(element: HTMLElement)
{
	const input = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(element, "input");

	input.dataset["initialValue"] = input.checked.toString();

	element.addEventListener("input",
		() =>
		{
			input.dataset["dirty"] = (input.checked.toString() != input.dataset["initialValue"]).toString();
		});
}

//
// Component
//

export async function initialiseCheckboxes()
{
	const checkboxes = document.querySelectorAll<HTMLInputElement>(".component-checkbox:not(.initialised)");

	for (const checkbox of checkboxes)
	{
		try
		{
			await initialise(checkbox);

			checkbox.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[Checkbox] Error initialising:", checkbox, error);
		}
	}
}