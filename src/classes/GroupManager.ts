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
	sortOrder: number;
};

export type GroupManagerOptions<Model> =
{
	sortGroups?: (a: GroupManagerGroup<Model>, b: GroupManagerGroup<Model>) => number;
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

	options: Required<GroupManagerOptions<Model>>;

	groupsByName: Map<string, GroupManagerGroup<Model>> = new Map();

	constructor(options: GroupManagerOptions<Model>)
	{
		this.options =
		{
			sortGroups: options.sortGroups ?? ((a, b) => a.sortOrder - b.sortOrder),
			mapGroupModel: options.mapGroupModel,
		};
	}

	addGroup(groupName: string, sortOrder = 0)
	{
		if (this.groupsByName.has(groupName))
		{
			return;
		}

		this.groupsByName.set(groupName, { name: groupName, models: [], sortOrder });
	}

	addItemToGroup(groupName: string, model: Model)
	{
		const group = this.groupsByName.get(groupName) ?? { name: groupName, models: [], sortOrder: 0 };

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
			.sort(this.options.sortGroups)
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