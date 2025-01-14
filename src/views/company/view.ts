//
// Imports
//

import { Prisma } from "@prisma/client";

import { GroupManager } from "../../classes/GroupManager.js";

import { Anchor } from "../../components/basic/Anchor.js";
import { Block } from "../../components/basic/Block.js";
import { Header } from "../../components/basic/Header.js";

import { Button } from "../../components/input/Button.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { CompanySettingsToolbar } from "../../components/toolbar/CompanySettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: GroupManager<Prisma.CompanyGetPayload<null>>;
	company: Prisma.CompanyGetPayload<null>;
	gamesDeveloped: Prisma.GameGetPayload<null>[];
	gamesPublished: Prisma.GameGetPayload<null>[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "companies",
		pageTitle: options.company.name + " | Companies",
		content: ListLayout(
			{
				toolbar: CompanySettingsToolbar(options.settings),
				groupManager: options.groupManager,
				createHref: "/companies/create",
				content: Wrapper(
					[
						Header(1, options.company.name),

						Button(
							{
								style: "success",
								href: "/companies/edit/" + options.company.id,
								iconName: "fa-solid fa-pen-to-square",
								text: "Edit",
							}),

						options.gamesDeveloped.length > 0
							? [
								Header(2, "Games developed"),
				
								// TODO: make a "grid" component that shows the game's cover art?
								options.gamesDeveloped.map((game) => Block(Anchor(game.name, "/games/view/" + game.id))),
							]
							: null,

						options.gamesPublished.length > 0
							? [
								Header(2, "Games published"),
				
								// TODO: make a "grid" component that shows the game's cover art?
								options.gamesPublished.map((game) => Block(Anchor(game.name, "/games/view/" + game.id))),
							]
							: null,
					]),
			}),
	};
}