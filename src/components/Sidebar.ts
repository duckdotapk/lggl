//
// Imports
//

import { DE } from "@lorenstuff/document-builder";

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
	const
	{
		page,
		currentPage,
		href,
		iconName,
		text,
	} = options;

	const classList = [ "component-sidebar-item" ];

	if (page != null && page == currentPage)
	{
		classList.push("selected");
	}

	return new DE("a",
		{
			class: classList.join(" "),

			href,
			title: text,

			"data-page": page,
		},
		[
			new DE("span", iconName),
		],
	);
}

function Separator()
{
	return new DE("div", "component-sidebar-separator");
}

//
// Component
//

export type SidebarPage =
	"games" |
	"companies" |
	"engines" |
	"platforms" |
	"series" |
	"audit" |
	"stats" |
	null;

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

		Item(
		{
			page: "series",
			currentPage,
			href: "/series",
			iconName: "fa-solid fa-list-timeline",
			text: "Series",
		}),

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