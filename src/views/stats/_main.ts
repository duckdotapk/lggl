//
// Imports
//

import { Block } from "../../components/basic/Block.js";
import { Header } from "../../components/basic/Header.js";
import { Paragraph } from "../../components/basic/Paragraph.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import * as StatisticLib from "../../libs/Statistic.js";

//
// View
//

export type ViewOptions =
{
	statCategoryManager: StatisticLib.StatCategoryManager;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "stats",
		pageTitle: "Stats",
		content: Wrapper(
			[
				Header(1, "Stats"),

				options.statCategoryManager.statCategories.map((statCategory) => Block(
					[
						Header(2, statCategory.name),

						statCategory.stats.map((stat) => Block(
							[
								Header(3, stat.name),
	
								Paragraph(stat.value),
							])),
					])),
			]),
	};
}