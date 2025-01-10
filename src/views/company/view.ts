//
// Imports
//

import { Prisma } from "@prisma/client";

import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";
import { Button } from "../../components/input/Button.js";

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
					]),

				Header(1, pageTitle),

				Header(2, "Edit company"),

				Button(
					{
						style: "success",
						href: "/companies/edit/" + options.company.id,
						iconName: "fa-solid fa-pen-to-square",
						text: "Edit company",
					}),

				// TODO: List games by this company?
			]),
	};
}