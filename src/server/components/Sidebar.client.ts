//
// Locals
//

async function initialise(element: HTMLElement)
{
	const selectedGameGroupItem = element.querySelector<HTMLAnchorElement>(".component-sidebar-group-item.selected");

	selectedGameGroupItem?.scrollIntoView({ block: "center" });
}

//
// Components
//

export async function initialiseSidebars()
{
	const sidebars = document.querySelectorAll<HTMLElement>(".component-sidebar:not(.initialised)");

	for (const element of sidebars)
	{
		try
		{
			await initialise(element);
			
			element.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[Sidebar] Error initialising:", element, error);
		}
	}
}