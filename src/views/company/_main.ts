//
// Imports
//

import { ListLayout, ListLayoutOptions } from "../../components/layout/ListLayout.js";

import { SiteOptions } from "../../components/Site.js";

//
// View
//

export type ViewOptions =
{
	groups: ListLayoutOptions["groups"];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "companies",
		pageTitle: "Companies",
		content: ListLayout(
			{
				toolbar: null,
				groups: options.groups,
				createHref: "/companies/create",
				content: null,
			}),
	};
}