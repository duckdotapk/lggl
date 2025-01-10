//
// Imports
//

import { Prisma } from "@prisma/client";

import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { UpsertCompanyForm } from "../../components/form/UpsertCompanyForm.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

type ViewOptions =
{
	company: Prisma.CompanyGetPayload<null>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const pageTitle = "Edit " + options.company.name;

	return {
		currentPage: "companies",
		pageTitle,
		content: Wrapper("45rem",
			[
				Breadcrumbs(
					[
						{ href: "/companies", text: "Companies" },
						{ href: "/companies/view/" + options.company.id, text: options.company.name },
						{ href: "/companies/edit/" + options.company.id, text: "Edit" },
					]),

				Header(1, pageTitle),

				UpsertCompanyForm(options.company),
			]),
	};
}