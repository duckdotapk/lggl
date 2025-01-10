//
// Imports
//

import { Prisma } from "@prisma/client";

import { Anchor } from "../../components/basic/Anchor.js";
import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";
import { Paragraph } from "../../components/basic/Paragraph.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";
import { Button } from "../../components/input/Button.js";

//
// View
//

export type ViewOptions =
{
	companies: Prisma.CompanyGetPayload<null>[];
}

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "companies",
		pageTitle: "Companies",
		content: Wrapper("45rem",
			[
				Breadcrumbs(
					[
						{ href: "/companies", text: "Companies" },
					]),

				Header(1, "Companies"),

				Header(2, "Create company"),

				Button(
					{
						href: "/companies/create",
						style: "success",
						iconName: "fa-solid fa-plus",
						text: "Create company",
					}),

				Header(2, "Existing companies"),

				options.companies.map((company) => Paragraph(Anchor(company.name, "/companies/view/" + company.id))),
			]),
	};
}