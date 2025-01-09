//
// Imports
//

import { DE } from "@donutteam/document-builder";

import { Anchor } from "../../components/basic/Anchor.js";
import { Header } from "../../components/basic/Header.js";
import { Paragraph } from "../../components/basic/Paragraph.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import * as AuditLib from "../../libs/Audit.js";

//
// View
//

export type ViewOptions =
{
	problemLists: AuditLib.ProblemList[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const totalProblems = options.problemLists.reduce((total, problemList) => total + problemList.problems.length, 0);

	return {
		currentPage: "audit",
		pageTitle: "Audit (" + totalProblems + " problem" + (totalProblems == 1 ? "" : "s") + ")",
		content: Wrapper("40rem",
			[
				Header(1, "Audit"),

				Paragraph(
					[
						"There are ",
						new DE("strong", null, totalProblems),
						" problem",
						totalProblems == 1 ? "" : "s",
						" across ",
						new DE("strong", null, options.problemLists.length),
						" game",
						options.problemLists.length == 1 ? "" : "s",
						" in your library:",
					]),

				options.problemLists.map(
					(problemList) =>
					{
						return [
							Header(2,
								[
									Anchor(problemList.game.name, "/?selectedGameId=" + problemList.game.id),

									problemList.game.steamAppId != null
										? [
											" ",
											Anchor(new DE("span", "fa-brands fa-steam"), "https://store.steampowered.com/app/" + problemList.game.steamAppId, "_blank"),
											" ",
											Anchor(new DE("span", "fa-solid fa-database"), "https://steamdb.info/app/" + problemList.game.steamAppId, "_blank"),
											" ",
											Anchor(new DE("span", "fa-solid fa-desktop"), "https://www.pcgamingwiki.com/api/appid.php?appid=" + problemList.game.steamAppId, "_blank")
										]
										: null,
								]),

							new DE("ul", null, problemList.problems.map((problem) => new DE("li", null, problem.description))),
						];
					}),
			]),
	};
}