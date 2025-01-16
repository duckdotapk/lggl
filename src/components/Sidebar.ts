//
// Imports
//

import { DE } from "@donutteam/document-builder";

//
// Locals
//

type ItemOptions =
{
	page: SidebarPage;
	currentPage: SidebarPage;
	href: string;
	iconName: string;
	text: string;
}

function Item(options: ItemOptions)
{
	let className = "component-sidebar-item";

	if (options.page != null && options.page == options.currentPage)
	{
		className += " selected";
	}

	return new DE("a",
		{
			class: className,

			href: options.href,
			title: options.text,

			"data-page": options.page,
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

export type SidebarPage = "games" | "companies" | "engines" | "platforms" | "audit" | "stats" | null;

export function Sidebar(currentPage: SidebarPage)
{
	return new DE("div", "component-sidebar",
		[
			Item(
				{
					page: "games",
					currentPage,
					href: "/games",
					iconName: "fa-solid fa-joystick",
					text: "Games",
				}),

			Separator(),

			Item(
				{
					page: "companies",
					currentPage,
					href: "/companies",
					iconName: "fa-solid fa-building",
					text: "Companies",
				}),

			Item(
				{
					page: "engines",
					currentPage,
					href: "/engines",
					iconName: "fa-solid fa-engine",
					text: "Engines",
				}),

			// TODO: Genres item

			Item(
				{
					page: "platforms",
					currentPage,
					href: "/platforms",
					iconName: "fa-solid fa-layer-group",
					text: "Platforms",
				}),

			// TODO: Series item

			Separator(),

			Item(
				{
					page: "audit",
					currentPage,
					href: "/audit",
					iconName: "fa-solid fa-clipboard-list",
					text: "Audit",
				}),

			Item(
				{
					page: "stats",
					currentPage,
					href: "/stats",
					iconName: "fa-solid fa-stars",
					text: "Audit",
				}),

			// TODO: Settings item
		]);
}