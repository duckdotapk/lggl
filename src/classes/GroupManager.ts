//
// Imports
//

import { ListLayoutGroupItemOptions, ListLayoutGroupOptions } from "../components/layout/ListLayout.js";

//
// Class
//

export class GroupManager<Model>
{
	// TODO: maybe this should be... somewhere else, idk where
	static getNameGroupName(name: string)
	{
		const charCode = name.toUpperCase().charCodeAt(0);

		if (charCode >= 48 && charCode <= 57)
		{
			return "#";
		}
		else if (charCode >= 65 && charCode <= 90)
		{
			return name.charAt(0).toUpperCase();
		}
		else
		{
			return "?";
		}
	}

	modelToGroupItem: (model: Model) => ListLayoutGroupItemOptions;

	groups: Map<string, ListLayoutGroupOptions> = new Map();

	constructor(modelToGroupItem: (data: Model) => ListLayoutGroupItemOptions)
	{
		this.modelToGroupItem = modelToGroupItem;
	}

	addItemToGroup(groupName: string, model: Model)
	{
		const group = this.groups.get(groupName) ??
		{
			name: groupName,
			items: [],
		};

		group.items.push(this.modelToGroupItem(model));

		this.groups.set(groupName, group);
	}

	addItemsToGroup(groupName: string, models: Model[])
	{
		for (const model of models)
		{
			this.addItemToGroup(groupName, model);
		}
	}

	getGroups()
	{
		return Array.from(this.groups.values());
	}
}