//
// Imports
//

import { DE } from "@lorenstuff/document-builder";

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
	const
	{
		href,
		text,
		pjaxSelector = undefined,
	} = options;

	return new DE("a",
		{
			class: "component-breadcrumbs-item",
			href,

			"data-pjax-selector": pjaxSelector,
		},
		[
			new DE("span", "text", text),
		],
	);
}

//
// Component
//

export function Breadcrumbs(items: ItemOptions[])
{
	return new DE("nav", "component-breadcrumbs", items.map(Item));
}