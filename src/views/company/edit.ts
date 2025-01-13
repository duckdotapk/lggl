//
// Imports
//

import { Prisma } from "@prisma/client";

import { Header } from "../../components/basic/Header.js";

import { UpsertCompanyForm } from "../../components/form/UpsertCompanyForm.js";

import { ListLayout, ListLayoutOptions } from "../../components/layout/ListLayout.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

type ViewOptions =
{
	groups: ListLayoutOptions["groups"];
	company: Prisma.CompanyGetPayload<null>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const pageTitle = "Edit " + options.company.name;

	return {
		currentPage: "companies",
		pageTitle,
		content: ListLayout(
			{
				toolbar: null,
				groups: options.groups,
				createHref: "/companies/create",
				content: Wrapper("45rem",
					[
						Header(1, pageTitle),
		
						UpsertCompanyForm(options.company),
					]),
			}),
	};
}