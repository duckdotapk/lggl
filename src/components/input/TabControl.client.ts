//
// Locals
//

async function initialise(element: HTMLElement)
{
	const tabs = element.querySelectorAll<HTMLElement>(".component-tab-control-tab");

	const tabContents = element.querySelectorAll<HTMLElement>(".component-tab-control-tab-content");

	for (const [ tabIndex, tab ]  of tabs.entries())
	{
		tab.addEventListener("click", () =>
		{
			for (const [ tabIndex2, tab ] of tabs.entries())
			{
				tab.dataset["active"] = (tabIndex == tabIndex2).toString();
			}

			for (const [ tabContentIndex, tabContent ] of tabContents.entries())
			{
				tabContent.dataset["active"] = (tabContentIndex == tabIndex).toString();
			}
		});
	}

	element.classList.add("initialised");
}

//
// Component
//

export async function initialiseTabControls()
{
	const elements = document.querySelectorAll<HTMLElement>(
		".component-tab-control:not(.initialised)",
	);

	for (const element of elements)
	{
		initialise(element)
			.then(() => console.log("[TabControl] Initialised:", element))
			.catch((error) => console.error("[TabControl] Error initialising:", element, error));
	}
}