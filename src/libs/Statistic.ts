//
// Imports
//

import { Child } from "@donutteam/document-builder";

//
// Classes
//

export class Stat
{
	name: Child;
	value: Child;

	constructor(name: Child, value: Child)
	{
		this.name = name;
		this.value = value;
	}
}

export class StatCategory
{
	name: string;
	stats: Stat[];

	constructor(name: string)
	{
		this.name = name;

		this.stats = [];
	}

	addStat(name: Child, value: Child)
	{
		this.stats.push(new Stat(name, value));
	}
}

export class StatCategoryManager
{
	statCategories: StatCategory[];

	constructor()
	{
		this.statCategories = [];
	}

	addCategory(name: string)
	{
		const statCategory = new StatCategory(name);

		this.statCategories.push(statCategory);

		return statCategory;
	}
}