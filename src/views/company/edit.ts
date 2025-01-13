//
// Imports
//

import { Prisma } from "@prisma/client";

import { GroupManager } from "../../classes/GroupManager.js";

import { Header } from "../../components/basic/Header.js";

import { UpsertCompanyForm } from "../../components/form/UpsertCompanyForm.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

type ViewOptions =
{
	groupManager: GroupManager<Prisma.CompanyGetPayload<null>>;
	company: Prisma.CompanyGetPayload<null>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "companies",
		pageTitle: "Edit " + options.company.name + " | Companies",
		content: ListLayout(
			{
				toolbar: null,
				groupManager: options.groupManager,
				createHref: "/companies/create",
				content: Wrapper("45rem",
					[
						Header(1, "Edit " + options.company.name),
		
						UpsertCompanyForm(options.company),
					]),
			}),
	};
}