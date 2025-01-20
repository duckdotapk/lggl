//
// Imports
//

import { Child, DE } from "@donutteam/document-builder";

import { Anchor } from "../../components/basic/Anchor.js";
import { Header } from "../../components/basic/Header.js";
import { Paragraph } from "../../components/basic/Paragraph.js";

import { Button } from "../../components/input/Button.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import * as AuditLib from "../../libs/Audit.js";

//
// View
//

export type ViewOptions =
{
	isStrictMode: boolean;
	problemLists: AuditLib.ProblemList[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const totalProblems = options.problemLists.reduce((total, problemList) => total + problemList.problems.length, 0);

	return {
		currentPage: "audit",
		pageTitle: "Audit (" + totalProblems + " problem" + (totalProblems == 1 ? "" : "s") + ")",
		content: Wrapper(
			[
				Header(1, "Audit"),

				options.isStrictMode
					? Button(
						{
							style: "secondary",
							href: "?strictMode=false",
							text: "Disable Strict mode",
						})
					: Button(
						{
							style: "secondary",
							href: "?strictMode=true",
							text: "Enable Strict mode",
						}),

				Paragraph(
					[
						"Found ",
						new DE("strong", null, totalProblems),
						" problem",
						totalProblems == 1 ? "" : "s",
						" in your library's data",
						totalProblems == 0 ? "." : ":",
					]),

				options.problemLists.map(
					(problemList) =>
					{
						return [
							Header(2,
								[
									Anchor(problemList.name, problemList.viewHref),
									" ",
									Anchor(new DE("span", "fa-solid fa-pen-to-square"), problemList.editHref, "_blank"),
								]),

							new DE("ul", null, problemList.problems.map((problem) =>
								{
									let children: Child[] = [];

									if (problem.isStrictModeOnly)
									{
										children.push(new DE("strong", null, "Strict Mode:"));
										children.push(" ");
									}

									children.push(problem.description);

									return new DE("li", null, children);
								})),
						];
					}),
			]),
	};
}