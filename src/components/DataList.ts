//
// Imports
//

import { Child, DE } from "@donutteam/document-builder";


//
// Locals
//

type ItemOptions =
{
	iconName?: string;
	name: Child;
	value: Child;
};

function Item(options: ItemOptions)
{
	return new DE("div", "component-data-list-item",
		[
			options.iconName != null
				? new DE("div", "icon", new DE("span", options.iconName))
				: null,

			new DE("div", "text",
				[
					new DE("div", "name", options.name),
		
					options.value != null ? new DE("div", "value", options.value) : null,
				]),
		]);
}

//
// Component
//

export function DataList(items: (ItemOptions | null)[])
{
	const nonNullItems = items.filter(item => item != null);

	if (nonNullItems.length == 0)
	{
		return null;
	}

	return new DE("div", "component-data-list", nonNullItems.map((item) => Item(item)));
}