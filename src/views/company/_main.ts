//
// Imports
//

import { Prisma } from "@prisma/client";

import { GroupManager } from "../../classes/GroupManager.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { CompanySettingsToolbar } from "../../components/toolbar/CompanySettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";

import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: GroupManager<Prisma.CompanyGetPayload<null>>;
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