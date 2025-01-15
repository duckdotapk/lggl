//
// Imports
//

import { ListLayoutGroupItemOptions, ListLayoutGroupOptions } from "../components/layout/ListLayout.js";

//
// Class
//

export type GroupManagerGroup<Model> =
{
	name: string;
	models: Model[];
};

export type GroupManagerOptions<Model> =
{
	mapGroupModel: (model: Model, group: GroupManagerGroup<Model>) => ListLayoutGroupItemOptions;
};

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

	options: GroupManagerOptions<Model>;

	groupsByName: Map<string, GroupManagerGroup<Model>> = new Map();

	constructor(options: GroupManagerOptions<Model>)
	{
		this.options = options;
	}

	addGroup(groupName: string)
	{
		if (this.groupsByName.has(groupName))
		{
			return;
		}

		this.groupsByName.set(groupName, { name: groupName, models: [] });
	}

	addItemToGroup(groupName: string, model: Model)
	{
		const group = this.groupsByName.get(groupName) ?? { name: groupName, models: [] };

		group.models.push(model);

		this.groupsByName.set(groupName, group);
	}

	addItemsToGroup(groupName: string, models: Model[])
	{
		for (const model of models)
		{
			this.addItemToGroup(groupName, model);
		}
	}

	getListLayoutGroups(): ListLayoutGroupOptions[]
	{
		return Array.from(this.groupsByName.values())
			.map((group) =>
			{
				return {
					name: group.name,
					items: group.models.map((model) => this.options.mapGroupModel(model, group)),
				};
			})
			.filter((group) => group.items.length > 0);
	}
}