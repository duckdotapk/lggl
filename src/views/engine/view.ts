//
// Imports
//

import { Prisma } from "@prisma/client";

import { Anchor } from "../../components/basic/Anchor.js";
import { Block } from "../../components/basic/Block.js";
import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { Button } from "../../components/input/Button.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { EngineSettingsToolbar } from "../../components/toolbar/EngineSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import * as EngineModelLib from "../../libs/models/Engine.js";
import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: Awaited<ReturnType<typeof EngineModelLib.createGroupManager>>;
	engine: Prisma.EngineGetPayload<null>;
	games: Prisma.GameGetPayload<null>[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const engineName = options.engine.shortName ?? options.engine.name;

	return {
		currentPage: "engines",
		pageTitle: engineName + " | Engines",
		content: ListLayout(
			{
				toolbar: EngineSettingsToolbar(options.settings),
				groupManager: options.groupManager,
				createHref: "/engines/create",
				content: Wrapper(
					[		
						Breadcrumbs(
							[
								{
									href: "/engines",
									text: "Engines",
									pjaxSelector: "main",
								},
								{
									href: "/engines/view/" + options.engine.id,
									text: engineName,
									pjaxSelector: "main",
								},
							]),

						Header(1, engineName),
		
						Button(
							{
								style: "success",
								href: "/engines/edit/" + options.engine.id,
								iconName: "fa-solid fa-pen-to-square",
								text: "Edit",
							}),
		
						options.games.length > 0
							? [
								Header(2, "Games powered by"),
				
								// TODO: make a "grid" component that shows the game's cover art?
								options.games.map((game) => Block(Anchor(game.name, "/games/view/" + game.id))),
							]
							: null,
					]),
			}),
	};
}