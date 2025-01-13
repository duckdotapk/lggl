//
// Component
//

import { Child, DE } from "@donutteam/document-builder";
import * as Utilities from "@donutteam/utilities";

import { Muted } from "../basic/Muted.js";

import { Button } from "../input/Button.js";

import { staticMiddleware } from "../../instances/server.js";

//
// Locals
//

type GroupItemOptions =
{
	selected: boolean;
	href: string;
	iconName: string;
	name: string;
	info: string;
};

function GroupItem(options: GroupItemOptions)
{
	let className = "component-list-layout-group-item";

	if (options.selected)
	{
		className += " selected";
	}

	return new DE("a",
		{
			class: className,
			href: options.href,

			"data-name": options.name,
			"data-normalized-name": options.name.toLowerCase().replace(/[^a-z0-9]/g, " "),
		},
		[
			new DE("div", "icon-wrapper",
				[
					options.iconName.startsWith("/")
						? new DE("img",
							{
								class: "icon image",
								src: staticMiddleware.getCacheBustedPath(options.iconName),
								alt: options.name + " icon",
							})
						: new DE("div", "icon font-awesome",
							[
								new DE("span", options.iconName + " fa-fw"),
							]),
				]),

			new DE("div", "text-wrapper",
				[
					new DE("div", "name", options.name),

					new DE("div", "info", Muted(options.info)),
				]),
		]);
}

type ListLayoutGroupOptions =
{
	name: string;
	items: GroupItemOptions[];
};

function Group(options: ListLayoutGroupOptions)
{
	return new DE("details",
		{
			class: "component-list-layout-group",
			open: true,

			"data-name": options.name,
		},
		[
			new DE("summary", "title",
				[
					options.name,
					" (",
					Utilities.NumberLib.format(options.items.length),
					")",
				]),

			options.items.map((item) => GroupItem(item)),
		]);
}

//
// Component
//

export type ListLayoutOptions =
{
	toolbar: Child;
	groups: ListLayoutGroupOptions[];
	createHref: string;
	content: Child;
};

export function ListLayout(options: ListLayoutOptions)
{
	return new DE("div", "component-list-layout",
		[
			new DE("div", "toolbar", options.toolbar),

			new DE("aside", "list",
				[
					options.groups.map((group) => Group(group)),
				]),

			new DE("div", "create",
				[
					Button(
						{
							style: "success",
							href: options.createHref,
							iconName: "fa-solid fa-plus",
							text: "Create new",
						}),
				]),

			new DE("main", "details", options.content),
		]);
}