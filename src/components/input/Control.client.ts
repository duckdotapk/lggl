//
// Locals
//

async function initialise(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
{
	element.dataset["initialValue"] = element.value;

	element.addEventListener("input", () =>
	{
		element.dataset["changed"] = (element.value != element.dataset["initialValue"]).toString();
	});

	element.classList.add("initialised");
}

//
// Component
//

export async function initialiseControls()
{
	const elements = document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
		".component-control:not(.initialised)",
	);

	for (const element of elements)
	{
		initialise(element)
			.then(() => console.log("[Control] Initialised:", element))
			.catch((error) => console.error("[Control] Error initialising:", element, error));
	}
}