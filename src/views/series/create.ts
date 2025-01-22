//
// Imports
//

import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { UpsertSeriesForm } from "../../components/form/UpsertSeriesForm.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { SeriesSettingsToolbar } from "../../components/toolbar/SeriesSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import * as SeriesModelLib from "../../libs/models/Series.js";
import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: Awaited<ReturnType<typeof SeriesModelLib.createGroupManager>>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "series",
		pageTitle: "Create series",
		content: ListLayout(
			{
				toolbar: SeriesSettingsToolbar(options.settings),
				groupManager: options.groupManager,
				createHref: "/series/create",
				content: Wrapper(
					[
						Breadcrumbs(
							[
								{
									href: "/series",
									text: "Series",
									pjaxSelector: "main",
								},
								{
									href: "/series/create",
									text: "Create",
									pjaxSelector: "main",
								},
							]),

						Header(1, "Create series"),
		
						UpsertSeriesForm(null),
					]),
			}),
	};
}