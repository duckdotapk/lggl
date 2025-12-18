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

import { SeriesSettingsToolbar } from "../../components/toolbar/SeriesSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import { createSeriesGroupManager } from "../../libs/models/Series.js";
import { Settings } from "../../libs/models/Setting.js";

//
// View
//

type ViewOptions =
{
	settings: Settings;
	groupManager: Awaited<ReturnType<typeof createSeriesGroupManager>>;
	series: Prisma.SeriesGetPayload<null>;
	games: Prisma.GameGetPayload<null>[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const pageTitle = options.series.name;

	return {
		currentPage: "series",
		pageTitle,
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
									href: "/series/view/" + options.series.id,
									text: options.series.name,
									pjaxSelector: "main",
								},
								{
									href: "/series/edit/" + options.series.id,
									text: "Edit",
									pjaxSelector: "main",
								},
							]),

						Header(1, pageTitle),
		
						Button(
							{
								style: "success",
								href: "/series/edit/" + options.series.id,
								iconName: "fa-solid fa-pen-to-square",
								text: "Edit",
							}),
		
						options.games.length > 0
							? [
								Header(2, "Games in this series"),
				
								// TODO: make a "grid" component that shows the game's cover art?
								options.games.map((game) => Block(Anchor(game.name, "/games/view/" + game.id))),
							]
							: null,
					]),
			}),
	};
}