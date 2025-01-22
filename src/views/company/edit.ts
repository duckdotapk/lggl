//
// Imports
//

import { Prisma } from "@prisma/client";

import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { UpsertCompanyForm } from "../../components/form/UpsertCompanyForm.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { CompanySettingsToolbar } from "../../components/toolbar/CompanySettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import * as CompanyModelLib from "../../libs/models/Company.js";
import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: Awaited<ReturnType<typeof CompanyModelLib.createGroupManager>>;
	company: Prisma.CompanyGetPayload<null>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "companies",
		pageTitle: "Edit " + options.company.name + " | Companies",
		content: ListLayout(
			{
				toolbar: CompanySettingsToolbar(options.settings),
				groupManager: options.groupManager,
				createHref: "/companies/create",
				content: Wrapper(
					[
						Breadcrumbs(
							[
								{
									href: "/companies",
									text: "Companies",
									pjaxSelector: "main",
								},
								{
									href: "/companies/view/" + options.company.id,
									text: options.company.name,
									pjaxSelector: "main",
								},
								{
									href: "/companies/edit/" + options.company.id,
									text: "Edit",
									pjaxSelector: "main",
								},
							]),

						Header(1, "Edit " + options.company.name),
		
						UpsertCompanyForm(options.company),
					]),
			}),
	};
}