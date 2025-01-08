//
// Imports
//

import { DE } from "@donutteam/document-builder";

import { Header } from "../components/basic/Header.js";
import { Paragraph } from "../components/basic/Paragraph.js";

import { SiteOptions } from "../components/Site.js";

import * as AuditLib from "../libs/Audit.js";

//
// View
//

export type ViewOptions =
{
	problemLists: AuditLib.ProblemList[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "audit",
		content: new DE("div",
			{
				style: "height: 100%; overflow-y: scroll; padding: 1rem",
			},
			[
				Header(1, "Audit"),

				Paragraph(
					[
						"There are ",
						new DE("strong", null, options.problemLists.length),
						" game",
						options.problemLists.length == 1 ? "" : "s",
						" with weird or missing data in your library:",
					]),

				options.problemLists.map(
					(problemList) =>
					{
						return [
							Header(2, problemList.game.name),

							new DE("ul", null, problemList.problems.map(
								(problem) =>
								{
									return new DE("li", null, problem.description);
								})),
						];
					}),
			]),
	};
}