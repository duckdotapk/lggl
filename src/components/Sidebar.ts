//
// Imports
//

import { DE } from "@donutteam/document-builder";

//
// Locals
//

type ItemOptions =
{
	isCurrent: boolean;
	href: string;
	iconName: string;
	text: string;
}

function Item(options: ItemOptions)
{
	let className = "component-sidebar-item";

	if (options.isCurrent)
	{
		className += " current";
	}

	return new DE("a",
		{
			class: className,

			href: options.href,
			title: options.text,
		},
		[
			new DE("span", options.iconName),
		]);
}

//
// Component
//

export type SidebarPage = "library" | "audit" | null;

export function Sidebar(currentPage: SidebarPage)
{
	return new DE("div", "component-sidebar",
		[
			Item(
				{
					isCurrent: currentPage == "library",
					href: "/",
					iconName: "fa-solid fa-books",
					text: "Library",
				}),

			Item(
				{
					isCurrent: currentPage == "audit",
					href: "/audit",
					iconName: "fa-solid fa-clipboard-list",
					text: "Audit",
				}),
		]);
}