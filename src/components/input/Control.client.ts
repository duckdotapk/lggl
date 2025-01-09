//
// Locals
//

async function initialise(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
{
	const initialValue = element.value;

	element.addEventListener("input",
		() =>
		{
			element.dataset["dirty"] = (element.value != initialValue).toString();
		});
}

//
// Component
//

export async function initialiseControls()
{
	const controls = document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(".component-control:not(.initialised)");

	for (const control of controls)
	{
		try
		{
			await initialise(control);

			control.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[Control] Error initialising:", control, error);
		}
	}
}