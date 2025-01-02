//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";
import { z } from "zod";

//
// Locals
//

async function loadCollapsedSidebarGroupNames()
{
	const rawCollapsedGroups = localStorage.getItem("CollapsedSidebarGroupNames");

	const collapsedGroupsParseResult = z.array(z.string()).safeParse(JSON.parse(rawCollapsedGroups ?? "[]"));

	return collapsedGroupsParseResult.success ? collapsedGroupsParseResult.data : [];
}

async function saveCollapsedSidebarGroupNames(names: string[])
{

	localStorage.setItem("CollapsedSidebarGroupNames", JSON.stringify(names));
}

async function initialise(element: HTMLElement)
{
	const sidebarSearchInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(element, ".component-sidebar-search");

	sidebarSearchInput.addEventListener("input",
		() =>
		{
			const query = sidebarSearchInput.value.trim().toLowerCase();

			const sidebarGroupItems = element.querySelectorAll<HTMLAnchorElement>(".component-sidebar-group-item");

			for (const sidebarGroupItem of sidebarGroupItems)
			{
				if (query == "")
				{
					sidebarGroupItem.style.display = "";

					continue;
				}

				const normalizedName = BrowserUtilities.ElementClientLib.getStringDataOrThrow(sidebarGroupItem, "normalizedName");

				if (normalizedName.includes(sidebarSearchInput.value.toLowerCase()))
				{
					sidebarGroupItem.style.display = "";

					const sidebarGroup = sidebarGroupItem.closest<HTMLDetailsElement>(".component-sidebar-group");

					if (sidebarGroup != null)
					{
						sidebarGroup.open = true;
					}
				}
				else
				{
					sidebarGroupItem.style.display = "none";
				}
			}
		});

	const collapsedSidebarGroupNames = await loadCollapsedSidebarGroupNames();

	const sidebarGroups = document.querySelectorAll<HTMLDetailsElement>(".component-sidebar-group");

	for (const sidebarGroup of sidebarGroups)
	{
		const sidebarGroupName = BrowserUtilities.ElementClientLib.getStringDataOrThrow(sidebarGroup, "name");

		if (!collapsedSidebarGroupNames.includes(sidebarGroupName))
		{
			sidebarGroup.open = true;
		}

		sidebarGroup.addEventListener("toggle", 
			async () =>
			{
				const collapsedSidebarGroupNames = sidebarGroup.open
					? (await loadCollapsedSidebarGroupNames()).filter(name => name !== sidebarGroupName)
					: (await loadCollapsedSidebarGroupNames()).concat(sidebarGroupName);

				saveCollapsedSidebarGroupNames(Array.from(new Set(collapsedSidebarGroupNames)));
			});
	}

	const selectedSidebarGroupItem = element.querySelector<HTMLAnchorElement>(".component-sidebar-group-item.selected");

	if (selectedSidebarGroupItem != null)
	{
		const sidebarGroup = selectedSidebarGroupItem.closest<HTMLDetailsElement>(".component-sidebar-group");
	
		if (sidebarGroup != null)
		{
			sidebarGroup.open = true;
		}
	
		selectedSidebarGroupItem?.scrollIntoView({ block: "nearest" });
	}
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