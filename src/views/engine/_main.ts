//
// Imports
//

import { ListLayout } from "../../components/layout/ListLayout.js";

import { EngineSettingsToolbar } from "../../components/toolbar/EngineSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";

import { createEngineGroupManager } from "../../libs/models/Engine.js";
import { Settings } from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: Settings;
	groupManager: Awaited<ReturnType<typeof createEngineGroupManager>>;
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