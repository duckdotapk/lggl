//
// Classes
//

export class Problem
{
	description: string;
	isStrictModeOnly: boolean;

	constructor(description: string, isStrictModeOnly: boolean)
	{
		this.description = description;
		this.isStrictModeOnly = isStrictModeOnly;
	}
}

export class ProblemList
{
	name: string;
	viewHref: string;
	editHref: string;

	problems: Problem[];

	constructor(name: string, viewHref: string, editHref: string)
	{
		this.name = name;
		this.viewHref = viewHref;
		this.editHref = editHref;

		this.problems = [];
	}

	addProblem(description: string, isStrictModeOnly: boolean)
	{
		const problem = new Problem(description, isStrictModeOnly);

		this.problems.push(problem);

		return problem;
	}
}