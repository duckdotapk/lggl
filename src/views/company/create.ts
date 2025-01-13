//
// Imports
//

import { Header } from "../../components/basic/Header.js";

import { UpsertCompanyForm } from "../../components/form/UpsertCompanyForm.js";

import { ListLayout, ListLayoutOptions } from "../../components/layout/ListLayout.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

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
		pageTitle: "Create | Companies",
		content: ListLayout(
			{
				toolbar: null,
				groups: options.groups,
				createHref: "/companies/create",
				content: Wrapper("45rem",
					[
						Header(1, "Create company"),

						UpsertCompanyForm(null),
					]),
			}),
	};
}