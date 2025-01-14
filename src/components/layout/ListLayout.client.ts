//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

//
// Locals
//

async function initialise(element: HTMLElement)
{
	let allGroupsCollapsed = true;

	const listLayoutGroups = element.querySelectorAll<HTMLDetailsElement>(".component-list-layout-group");
	const selectedListLayoutGroupItem = BrowserUtilities.ElementClientLib.getElement<HTMLAnchorElement>(element, ".component-list-layout-group-item.selected");
	const toggleGroupsButton = BrowserUtilities.ElementClientLib.getElementOrThrow(element, `[data-action="toggleGroups"]`);
	const toggleGroupsButtonIcon = BrowserUtilities.ElementClientLib.getElementOrThrow(toggleGroupsButton, ".icon");
	const toggleGroupsButtonText = BrowserUtilities.ElementClientLib.getElementOrThrow(toggleGroupsButton, ".text");

	const setGroupsCollapsed = (collapsed: boolean) =>
	{
		for (const listLayoutGroup of listLayoutGroups)
		{
			listLayoutGroup.open = !collapsed;
		}

		allGroupsCollapsed = collapsed;

		toggleGroupsButtonIcon.className = collapsed ? "icon fa-solid fa-chevron-down" : "icon fa-solid fa-chevron-up";
		toggleGroupsButtonText.textContent = collapsed ? "Expand all groups" : "Collapse all groups";
	}

	if (selectedListLayoutGroupItem != null)
	{
		const gameListGroup = selectedListLayoutGroupItem.closest<HTMLDetailsElement>(".component-list-layout-group");
	
		if (gameListGroup != null)
		{
			gameListGroup.open = true;
		}
	
		selectedListLayoutGroupItem.scrollIntoView({ block: "nearest" });
	}

	toggleGroupsButton.addEventListener("click", () => setGroupsCollapsed(!allGroupsCollapsed));
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

export async function updateListLayouts()
{
	const listLayouts = document.querySelectorAll<HTMLElement>(".component-list-layout");

	for (const listLayout of listLayouts)
	{
		const listLayoutGroupItems = listLayout.querySelectorAll<HTMLAnchorElement>(".component-list-layout-group-item");

		for (const listLayoutGroupItem of listLayoutGroupItems)
		{
			// HACK: this feels fragile...
			const id = listLayoutGroupItem.href.split("/").pop();
			const selectedId = window.location.href.split("/").pop();

			if (id == selectedId)
			{
				listLayoutGroupItem.classList.add("selected");
			}
			else
			{
				listLayoutGroupItem.classList.remove("selected");
			}
		}
	}
}