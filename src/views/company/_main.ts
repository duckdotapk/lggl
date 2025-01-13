//
// Imports
//

import { Prisma } from "@prisma/client";

import { Anchor } from "../../components/basic/Anchor.js";
import { Block } from "../../components/basic/Block.js";
import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { Button } from "../../components/input/Button.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

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

				Button(
					{
						href: "/companies/create",
						style: "success",
						iconName: "fa-solid fa-plus",
						text: "Create",
					}),


				options.companies.map((company) => Block(Anchor(company.name, "/companies/view/" + company.id))),
			]),
	};
}