//
// Imports
//

import { DE } from "@donutteam/document-builder";

//
// Locals
//

type ItemOptions =
{
	href: string;
	text: string;
	pjaxSelector?: string;
};

function Item(options: ItemOptions)
{
	return new DE("a",
		{
			class: "component-breadcrumbs-item",
			href: options.href,

			"data-pjax-selector": options.pjaxSelector,
		},
		[
			new DE("span", "text", options.text),
		]);
}

//
// Component
//

export function Breadcrumbs(items: ItemOptions[])
{
	return new DE("nav", "component-breadcrumbs", items.map(Item));
}