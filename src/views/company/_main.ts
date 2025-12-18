//
// Imports
//

import { ListLayout } from "../../components/layout/ListLayout.js";

import { CompanySettingsToolbar } from "../../components/toolbar/CompanySettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";

import { createCompanyGroupManager } from "../../libs/models/Company.js";
import { Settings } from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: Settings;
	groupManager: Awaited<ReturnType<typeof createCompanyGroupManager>>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "companies",
		pageTitle: "Companies",
		content: ListLayout(
		{
			toolbar: CompanySettingsToolbar(options.settings),
			groupManager: options.groupManager,
			createHref: "/companies/create",
			content: null,
		}),
	};
}