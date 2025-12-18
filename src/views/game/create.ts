//
// Imports
//

import { Header } from "../../components/basic/Header.js";

import { UpsertGameForm } from "../../components/form/UpsertGameForm.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { GameSettingsToolbar } from "../../components/toolbar/GameSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

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
		pageTitle: "Create | Games",
		content: ListLayout(
		{
			toolbar: GameSettingsToolbar(options.settings),
			groupManager: options.groupManager,
			createHref: "/games/create",
			content: Wrapper(
			[
				Header(1, "Create game"),

				UpsertGameForm(null),
			]),
		}),
	};
}