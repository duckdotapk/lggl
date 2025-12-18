//
// Imports
//

import { getElementOrThrow } from "@lorenstuff/browser-utilities";

//
// Locals
//

async function initialise(element: HTMLElement)
{
	const input = getElementOrThrow<HTMLInputElement>(element, "input");

	input.dataset["initialValue"] = input.checked.toString();

	element.addEventListener("input", () =>
	{
		input.dataset["changed"] = (input.checked.toString() != input.dataset["initialValue"]).toString();
	});

	element.classList.add("initialised");
}

//
// Component
//

export async function initialiseCheckboxes()
{
	const elements = document.querySelectorAll<HTMLInputElement>(
		".component-checkbox:not(.initialised)",
	);

	for (const element of elements)
	{
		initialise(element)
			.then(() => console.log("[Checkbox] Initialised:", element))
			.catch((error) => console.error("[Checkbox] Error initialising:", element, error));
	}
}