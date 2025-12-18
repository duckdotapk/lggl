//
// Imports
//

import { ListLayout } from "../../components/layout/ListLayout.js";

import { SeriesSettingsToolbar } from "../../components/toolbar/SeriesSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";

import { createSeriesGroupManager } from "../../libs/models/Series.js";
import { Settings } from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: Settings;
	groupManager: Awaited<ReturnType<typeof createSeriesGroupManager>>;
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