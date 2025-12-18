//
// Imports
//

import { ListLayout } from "../../components/layout/ListLayout.js";

import { GameSettingsToolbar } from "../../components/toolbar/GameSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";

import { createGameGroupManager } from "../../libs/models/Game.js";
import { Settings } from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: Settings;
	groupManager: Awaited<ReturnType<typeof createGameGroupManager>>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "games",
		pageTitle: "Games",
		content: ListLayout(
		{
			toolbar: GameSettingsToolbar(options.settings),
			groupManager: options.groupManager,
			createHref: "/games/create",
			content: null,
		}),
	};
}