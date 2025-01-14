//
// Component
//

import { Child, DE } from "@donutteam/document-builder";
import * as Utilities from "@donutteam/utilities";

import { GroupManager } from "../../classes/GroupManager.js";

import { Muted } from "../basic/Muted.js";

import { Button } from "../input/Button.js";

import { staticMiddleware } from "../../instances/server.js";

//
// Locals
//

export type ListLayoutGroupItemOptions =
{
	selected: boolean;
	href: string;
	iconName: string;
	name: string;
	info: Child;
};

function GroupItem(options: ListLayoutGroupItemOptions)
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

			"data-pjax-selector": ".component-list-layout .content",
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

export type ListLayoutGroupOptions =
{
	name: string;
	items: ListLayoutGroupItemOptions[];
};

function Group(options: ListLayoutGroupOptions)
{
	return new DE("details",
		{
			class: "component-list-layout-group",
			open: false,

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
	groupManager: GroupManager<any>;
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
					options.groupManager.getGroups().map((group) => Group(group)),
				]),

			new DE("div", "buttons",
				[
					Button(
						{
							style: "secondary",
							type: "button",
							extraAttributes:
							{
								"data-action": "toggleGroups",
							},
							iconName: "fa-solid fa-chevron-down",
							text: "Expand all groups",
						}),

					Button(
						{
							style: "success",
							href: options.createHref,
							extraAttributes:
							{
								"data-pjax-selector": "main",
							},
							iconName: "fa-solid fa-plus",
							text: "Create new",
						}),
				]),

			new DE("main", "content", options.content),
		]);
}