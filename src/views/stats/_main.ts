//
// Imports
//

import { Child } from "@donutteam/document-builder";
import { Header } from "../../components/basic/Header.js";
import { Paragraph } from "../../components/basic/Paragraph.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

export type ViewOptions =
{
	stats: { name: Child; value: Child }[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "stats",
		pageTitle: "Stats",
		content: Wrapper(
			[
				Header(1, "Stats"),

				options.stats.map(
					(stat) =>
					{
						return [
							Header(2, stat.name),

							Paragraph(stat.value),
						];
					}),
			]),
	};
}