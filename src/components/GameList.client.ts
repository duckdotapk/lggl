//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";
import { z } from "zod";

//
// Locals
//

async function loadCollapsedGameListGroupNames()
{
	const rawCollapsedGroups = localStorage.getItem("CollapsedGameListGroupNames");

	const collapsedGroupsParseResult = z.array(z.string()).safeParse(JSON.parse(rawCollapsedGroups ?? "[]"));

	return collapsedGroupsParseResult.success ? collapsedGroupsParseResult.data : [];
}

async function saveCollapsedGameListGroupNames(names: string[])
{
	localStorage.setItem("CollapsedGameListGroupNames", JSON.stringify(names));
}

async function initialise(element: HTMLElement)
{
	const gameListSearchInput = BrowserUtilities.ElementClientLib.getElementOrThrow<HTMLInputElement>(element, ".component-game-list-search");

	gameListSearchInput.addEventListener("input",
		() =>
		{
			const query = gameListSearchInput.value.trim().toLowerCase();

			const gameListGroupItems = element.querySelectorAll<HTMLAnchorElement>(".component-game-list-group-item");

			for (const gameListGroupItem of gameListGroupItems)
			{
				if (query == "")
				{
					gameListGroupItem.style.display = "";

					continue;
				}

				const normalizedName = BrowserUtilities.ElementClientLib.getStringDataOrThrow(gameListGroupItem, "normalizedName");

				if (normalizedName.includes(gameListSearchInput.value.toLowerCase()))
				{
					gameListGroupItem.style.display = "";

					const gameListGroup = gameListGroupItem.closest<HTMLDetailsElement>(".component-game-list-group");

					if (gameListGroup != null)
					{
						gameListGroup.open = true;
					}
				}
				else
				{
					gameListGroupItem.style.display = "none";
				}
			}
		});

	const collapsedGameListGroupnames = await loadCollapsedGameListGroupNames();

	const gameListGroups = document.querySelectorAll<HTMLDetailsElement>(".component-game-list-group");

	for (const gameListGroup of gameListGroups)
	{
		const gameListGroupName = BrowserUtilities.ElementClientLib.getStringDataOrThrow(gameListGroup, "name");

		if (!collapsedGameListGroupnames.includes(gameListGroupName))
		{
			gameListGroup.open = true;
		}

		gameListGroup.addEventListener("toggle", 
			async () =>
			{
				const collapsedGameListGroupNames = gameListGroup.open
					? (await loadCollapsedGameListGroupNames()).filter(name => name !== gameListGroupName)
					: (await loadCollapsedGameListGroupNames()).concat(gameListGroupName);

				saveCollapsedGameListGroupNames(Array.from(new Set(collapsedGameListGroupNames)));
			});
	}

	const selectedGameListGroupItem = element.querySelector<HTMLAnchorElement>(".component-game-list-group-item.selected");

	if (selectedGameListGroupItem != null)
	{
		const gameListGroup = selectedGameListGroupItem.closest<HTMLDetailsElement>(".component-game-list-group");
	
		if (gameListGroup != null)
		{
			gameListGroup.open = true;
		}
	
		selectedGameListGroupItem?.scrollIntoView({ block: "nearest" });
	}
}

//
// Components
//

export async function initialiseGameLists()
{
	const gameLists = document.querySelectorAll<HTMLElement>(".component-game-list:not(.initialised)");

	for (const element of gameLists)
	{
		try
		{
			await initialise(element);
			
			element.classList.add("initialised");
		}
		catch (error)
		{
			console.error("[GameList] Error initialising:", element, error);
		}
	}
}