//
// Locals
//

async function initialise(element: HTMLElement)
{
	const selectedListLayoutGroupItem = element.querySelector<HTMLAnchorElement>(".component-list-layout-group-item.selected");

	if (selectedListLayoutGroupItem != null)
	{
		const gameListGroup = selectedListLayoutGroupItem.closest<HTMLDetailsElement>(".component-list-layout-group");
	
		if (gameListGroup != null)
		{
			gameListGroup.open = true;
		}
	
		selectedListLayoutGroupItem.scrollIntoView({ block: "nearest" });
	}
}

//
// Components
//

export async function initialiseListLayouts()
{
	const listLayouts = document.querySelectorAll<HTMLElement>(".component-list-layout:not(.initialised)");

	for (const element of listLayouts)
	{
		try
		{
			await initialise(element);
			
			element.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[ListLayout] Error initialising:", element, error);
		}
	}
}