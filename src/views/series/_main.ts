//
// Imports
//

import { GroupManager } from "../../classes/GroupManager.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { SeriesSettingsToolbar } from "../../components/toolbar/SeriesSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";

import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: GroupManager<any>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "series",
		pageTitle: "Series",
		content: ListLayout(
			{
				toolbar: SeriesSettingsToolbar(options.settings),
				groupManager: options.groupManager,
				createHref: "/series/create",
				content: null,
			}),
	};
}