//
// Imports
//

import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { UpsertCompanyForm } from "../../components/form/UpsertCompanyForm.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

export function view(): Partial<SiteOptions>
{
	return {
		currentPage: "companies",
		pageTitle: "Create company",
		content: Wrapper("45rem",
			[
				Breadcrumbs(
					[
						{ href: "/companies", text: "Companies" },
						{ href: "/companies/create", text: "Create" },
					]),

				Header(1, "Create company"),

				UpsertCompanyForm(null),
			]),
	};
}