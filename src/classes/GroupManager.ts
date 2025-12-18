//
// Imports
//

import { Child, ElementAttributes } from "@lorenstuff/document-builder";
import { DateTime } from "luxon";

import { ListLayoutGroupOptions } from "../components/layout/ListLayout.js";

import { Settings } from "../libs/models/Setting.js";

//
// Class
//

export class GroupManagerGroup<T>
{
	name: string;
	models: T[];
	sortOrder: number;

	constructor(name: string, sortOrder = 0)
	{
		this.name = name;
		this.models = [];
		this.sortOrder = sortOrder;
	}

	addModel(model: T)
	{
		this.models.push(model);
	}

	addModels(models: T[])
	{
		this.models.push(...models);
	}
}

export abstract class GroupManager<T extends { id: number }>
{
	static getDateGroupName(dateTime: DateTime)
	{
		const nowDateTime = DateTime.now();

		if (dateTime.hasSame(nowDateTime, "day"))
		{
			return "Today";
		}
		
		if (dateTime.hasSame(nowDateTime.minus({ days: 1 }), "day"))
		{
			return "Yesterday";
		}

		if (dateTime.hasSame(nowDateTime, "week"))
		{
			return "This Week";
		}

		if (dateTime.hasSame(nowDateTime.minus({ weeks: 1 }), "week"))
		{
			return "Last Week";
		}
		
		if (dateTime.hasSame(nowDateTime, "year"))
		{
			return dateTime.monthLong + " " + dateTime.year.toString(); 
		}

		return dateTime.year.toString();
	}

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

	settings: Settings;
	models: T[];
	selectedModel: { id: number } | null;

	groupsByName: Map<string, GroupManagerGroup<T>>;

	constructor
	(
		settings: Settings,
		models: T[],
		selectedModel: { id: number } | null,
	)
	{
		this.settings = settings;
		this.models = models;
		this.selectedModel = selectedModel;

		this.groupsByName = new Map();
	}

	addGroup(name: string, sortOrder = 0)
	{
		this.groupsByName.set(name, new GroupManagerGroup(name, sortOrder));
	}

	addModelToGroup(groupName: string, model: T)
	{
		const group = this.groupsByName.get(groupName) ?? new GroupManagerGroup(groupName);

		group.addModel(model);

		this.groupsByName.set(groupName, group);
	}

	addModelsToGroup(groupName: string, models: T[])
	{
		const group = this.groupsByName.get(groupName) ?? new GroupManagerGroup(groupName);

		group.addModels(models);

		this.groupsByName.set(groupName, group);
	}

	filterModels(models: T[]): T[]
	{
		return models;
	}
	
	// TODO: potentially remove this and make everything use sortGroupModels
	abstract sortModels(models: T[]): T[];

	abstract groupModels(models: T[]): GroupManagerGroup<T>[];

	sortGroups(groups: GroupManagerGroup<T>[])
	{
		return groups.toSorted((a, b) => b.sortOrder - a.sortOrder);
	}

	sortGroupModels(_groupName: string, models: T[])
	{
		return models;
	}

	abstract getItemHref(model: T, group: GroupManagerGroup<T>): string;

	getItemAttributes(_model: T, _group: GroupManagerGroup<T>): ElementAttributes
	{
		return {};
	}

	abstract getItemIconName(model: T, group: GroupManagerGroup<T>): string;

	abstract getItemName(model: T, group: GroupManagerGroup<T>): string;

	getItemInfo(_model: T, _group: GroupManagerGroup<T>): Child
	{
		return null;
	}

	getListLayoutGroups(): ListLayoutGroupOptions[]
	{
		const filteredModels = this.filterModels([ ...this.models ]);

		const sortedModels = this.sortModels([ ...filteredModels ]);

		const groups = this.groupModels([ ...sortedModels ]);

		const sortedGroups = this.sortGroups([ ...groups ]);

		return sortedGroups
			.filter((group) => group.models.length > 0)
			.map((group) =>
			({
				name: group.name,
				items: this.sortGroupModels(group.name, group.models).map((model) =>
				({
					selected: model.id == this.selectedModel?.id,
					href: this.getItemHref(model, group),
					extraAttributes: this.getItemAttributes(model, group),
					iconName: this.getItemIconName(model, group),
					name: this.getItemName(model, group),
					info: this.getItemInfo(model, group),
				})),
			}));
	}
}