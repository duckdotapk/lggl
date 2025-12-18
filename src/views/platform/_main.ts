//
// Imports
//

import { ListLayout } from "../../components/layout/ListLayout.js";

import { PlatformSettingsToolbar } from "../../components/toolbar/PlatformSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";

import { createPlatformGroupManager } from "../../libs/models/Platform.js";
import { Settings } from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: Settings;
	groupManager: Awaited<ReturnType<typeof createPlatformGroupManager>>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "platforms",
		pageTitle: "Platforms",
		content: ListLayout(
		{
			toolbar: PlatformSettingsToolbar(options.settings),
			groupManager: options.groupManager,
			createHref: "/platforms/create",
			content: null,
		}),
	};
}