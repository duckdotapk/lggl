//
// Imports
//

import { GameSettingsToolbar } from "../../components/toolbar/GameSettingsToolbar.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { GameActionToolbar } from "../../components/toolbar/GameActionToolbar.js";

import { GameDetails } from "../../components/GameDetails.js";
import { GameHeader } from "../../components/GameHeader.js";
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
	game: Parameters<typeof GameDetails>[0];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "games",
		pageTitle: options.game.name + " | Games",
		content: ListLayout(
		{
			toolbar: GameSettingsToolbar(options.settings),
			groupManager: options.groupManager,
			createHref: "/games/create",
			content:
			[
				GameHeader(options.game),
				GameActionToolbar(options.game),
				GameDetails(options.game),
			],
		}),
	};
}