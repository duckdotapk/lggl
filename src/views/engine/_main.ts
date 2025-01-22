//
// Imports
//

import { ListLayout } from "../../components/layout/ListLayout.js";

import { EngineSettingsToolbar } from "../../components/toolbar/EngineSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";

import * as EngineModelLib from "../../libs/models/Engine.js";
import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: Awaited<ReturnType<typeof EngineModelLib.createGroupManager>>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "engines",
		pageTitle: "Engines",
		content: ListLayout(
			{
				toolbar: EngineSettingsToolbar(options.settings),
				groupManager: options.groupManager,
				createHref: "/engines/create",
				content: null,
			}),
	};
}