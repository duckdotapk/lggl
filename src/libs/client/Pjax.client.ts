//
// Imports
//

import * as BrowserUtilities from "@donutteam/browser-utilities";

//
// Variables
//

export const defaultSelector = ".component-site .content";

let xhr: XMLHttpRequest | null = null;

//
// Utility Functions
//

function replaceSelectorContent(html: string, selector: string, preserveScrollPosition: boolean)
{
	//
	// Get Current Selector Element + Scroll Position
	//

	const currentSelectorElement = BrowserUtilities.ElementClientLib.getElementOrThrow(document, selector);

	const currentSelectorElementScrollTop = currentSelectorElement.scrollTop;

	//
	// Get Current Selector Element Tab Control Selected Tab Indices
	//

	const currentSelectorElementTabControls = currentSelectorElement.querySelectorAll<HTMLElement>(".component-tab-control");

	const currentSelectorElementTabControlSelectedTabIndices: number[] = [];

	tabControlLoop: for (const tabControl of currentSelectorElementTabControls)
	{
		const tabs = tabControl.querySelectorAll<HTMLElement>(".component-tab-control-tab");

		for (const [ tabIndex, tab ] of tabs.entries())
		{
			if (tab.dataset["active"] == "true")
			{
				currentSelectorElementTabControlSelectedTabIndices.push(tabIndex);

				continue tabControlLoop;
			}
		}

		currentSelectorElementTabControlSelectedTabIndices.push(-1);
	}

	//
	// Get New Selector Element
	//

	const domParser = new DOMParser();

	const newDocument = domParser.parseFromString(html, "text/html");

	const newSelectorElement = BrowserUtilities.ElementClientLib.getElementOrThrow(newDocument, selector);

	const newSelectorElementTabControls = newSelectorElement.querySelectorAll<HTMLElement>(".component-tab-control");

	for (const [ tabControlIndex, tabControl ] of newSelectorElementTabControls.entries())
	{
		const currentSelectedTabIndex = currentSelectorElementTabControlSelectedTabIndices[tabControlIndex] ?? -1;

		if (currentSelectedTabIndex == -1)
		{
			continue;
		}

		const tabs = tabControl.querySelectorAll<HTMLElement>(".component-tab-control-tab");

		for (const [ tabIndex, tab ] of tabs.entries())
		{
			if (tabIndex == currentSelectedTabIndex)
			{
				tab.dataset["active"] = "true";
			}
			else
			{
				tab.dataset["active"] = "false";
			}
		}

		const tabContents = tabControl.querySelectorAll<HTMLElement>(".component-tab-control-tab-content");

		for (const [ tabContentIndex, tabContent ] of tabContents.entries())
		{
			if (tabContentIndex == currentSelectedTabIndex)
			{
				tabContent.dataset["active"] = "true";
			}
			else
			{
				tabContent.dataset["active"] = "false";
			}
		}
	}

	//
	// Update Document
	//

	document.title = newDocument.title;

	currentSelectorElement.replaceWith(newSelectorElement);

	if (preserveScrollPosition)
	{
		newSelectorElement.scrollTop = currentSelectorElementScrollTop;
	}
}

function load(href: string, action: "push" | "pop" | "replace", selector: string)
{
	if (xhr != null && xhr.readyState != XMLHttpRequest.DONE)
	{
		xhr.abort();
	}

	xhr = new XMLHttpRequest();

	xhr.open("GET", href, true);

	xhr.addEventListener("load", 
		() =>
		{
			replaceSelectorContent(xhr!.responseText, selector, action == "replace");

			if (action == "push")
			{
				window.history.pushState({ selector }, "", xhr!.responseURL);
			}

			upgradeAnchors();

			document.dispatchEvent(new CustomEvent("lggl:pjaxLoad"));
		});

	xhr.send();
}

function upgradeAnchors()
{
	const anchors = document.querySelectorAll<HTMLAnchorElement>("a:not(.pjax):not(.no-pjax)");

	if (anchors.length == 0)
	{
		return;
	}

	console.log("[PjaxClientLib] Processing " + anchors.length + " unprocessed anchors...");

	const upgradableAnchors: HTMLAnchorElement[] = [];

	for (const anchor of anchors)
	{
		const isSameOrigin = anchor.href.startsWith(window.location.origin);

		const isTargetingSelf = anchor.target == "" || anchor.target == "_self";

		if (!isSameOrigin || !isTargetingSelf)
		{
			anchor.classList.add("no-pjax");

			continue;
		}

		upgradableAnchors.push(anchor);
	}

	console.log("[PjaxClientLib] Upgrading " + upgradableAnchors.length + " anchors...");

	for (const anchor of upgradableAnchors)
	{
		anchor.classList.add("pjax");

		anchor.addEventListener("click", 
			(event) =>
			{
				// Note: Want CTRL/CMD+Click to work as normal
				if (event.ctrlKey || event.metaKey)
				{
					return;
				}
			
				event.preventDefault();
			
				const selector = BrowserUtilities.ElementClientLib.getStringData(anchor, "pjaxSelector") ?? defaultSelector;
			
				load(anchor.href, "push", selector);
			});
	}
}

export function initialise(onLoad: () => void)
{
	upgradeAnchors();

	document.addEventListener("lggl:pjaxLoad", onLoad);

	window.addEventListener("popstate",
		() =>
		{
			const selector = window.history.state?.selector ?? defaultSelector;

			load(window.location.href, "pop", selector);
		});
}

export function changeView(href: string)
{
	load(href, "push", defaultSelector);
}

export function reloadView(selector?: string)
{
	const currentUrl = window.location.href;

	load(currentUrl, "replace", selector ?? window.history.state?.selector ?? defaultSelector);
}