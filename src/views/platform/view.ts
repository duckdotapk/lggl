//
// Imports
//

import { Prisma } from "@prisma/client";

import { GroupManager } from "../../classes/GroupManager.js";

import { Anchor } from "../../components/basic/Anchor.js";
import { Block } from "../../components/basic/Block.js";
import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { Button } from "../../components/input/Button.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { PlatformSettingsToolbar } from "../../components/toolbar/PlatformSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: GroupManager<Prisma.PlatformGetPayload<null>>;
	platform: Prisma.PlatformGetPayload<null>;
	games: Prisma.GameGetPayload<null>[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const pageTitle = options.platform.name;

	return {
		currentPage: "platforms",
		pageTitle,
		content: ListLayout(
			{
				toolbar: PlatformSettingsToolbar(options.settings),
				groupManager: options.groupManager,
				createHref: "/platforms/create",
				content: Wrapper(
					[		
						Breadcrumbs(
							[
								{
									href: "/platforms",
									text: "Platforms",
									pjaxSelector: "main",
								},
								{
									href: "/platforms/view/" + options.platform.id,
									text: options.platform.name,
									pjaxSelector: "main",
								},
								{
									href: "/platforms/edit/" + options.platform.id,
									text: "Edit",
									pjaxSelector: "main",
								},
							]),

						Header(1, pageTitle),
		
						Button(
							{
								style: "success",
								href: "/platforms/edit/" + options.platform.id,
								iconName: "fa-solid fa-pen-to-square",
								text: "Edit",
							}),
		
						options.games.length > 0
							? [
								Header(2, "Games on this platform"),
				
								// TODO: make a "grid" component that shows the game's cover art?
								options.games.map((game) => Block(Anchor(game.name, "/games/view/" + game.id))),
							]
							: null,
					]),
			}),
	};
}