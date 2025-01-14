//
// Imports
//

import { Child, DE } from "@donutteam/document-builder";

//
// Component
//

export type DataListItem =
{
	iconName?: string;
	name: Child;
	value: Child;
};

export function DataList(items: (DataListItem | null)[])
{
	const nonNullItems = items.filter(item => item != null);

	if (nonNullItems.length == 0)
	{
		return null;
	}

	return new DE("div", "component-data-list", nonNullItems.map((item) => new DE("div", "item",
		[
			item.iconName != null
				? new DE("div", "icon", new DE("span", item.iconName))
				: null,

			new DE("div", "name", item.name),

			new DE("div", "value", item.value),
		])));
}