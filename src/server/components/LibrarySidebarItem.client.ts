//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

//
// Locals
//

function initialise(item: HTMLElement)
{
	const gameId = BrowserUtilities.ElementClientLib.getIntegerDataOrThrow(item, "gameId");

	item.addEventListener("click",
		() =>
		{
			console.log(gameId);

			// TODO: change what game details are shown
		});
}

//
// Component
//

export async function initialiseLibrarySidebarItems()
{
	const librarySidebarItems = document.querySelectorAll<HTMLElement>(".component-library-sidebar-item:not(.initialised)");

	for (const librarySidebarItem of librarySidebarItems)
	{
		try
		{
			initialise(librarySidebarItem);

			librarySidebarItem.classList.add("initialised");
		}
		catch (error)
		{
			console.log("[Sidebar] Error initialising SidebarItem:", librarySidebarItem, error);
		}
	}
}