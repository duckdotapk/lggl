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

function Separator()
{
	return new DE("div", "component-sidebar-separator");
}

//
// Component
//

export type SidebarPage = "games" | "companies" | "engines" | "audit" | null;

export function Sidebar(currentPage: SidebarPage)
{
	return new DE("div", "component-sidebar",
		[
			Item(
				{
					isCurrent: currentPage == "games",
					href: "/games",
					iconName: "fa-solid fa-joystick",
					text: "Games",
				}),

			Separator(),

			Item(
				{
					isCurrent: currentPage == "companies",
					href: "/companies",
					iconName: "fa-solid fa-building",
					text: "Companies",
				}),

			Item(
				{
					isCurrent: currentPage == "engines",
					href: "/engines",
					iconName: "fa-solid fa-engine",
					text: "Engines",
				}),

			// TODO: Modes item

			// TODO: Genres item

			// TODO: Platforms item

			// TODO: Series item

			Separator(),

			Item(
				{
					isCurrent: currentPage == "audit",
					href: "/audit",
					iconName: "fa-solid fa-clipboard-list",
					text: "Audit",
				}),

			// TODO: Settings item
		]);
}