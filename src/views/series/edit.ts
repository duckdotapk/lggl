//
// Imports
//

import { Prisma } from "@prisma/client";

import { Block } from "../../components/basic/Block.js";
import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { UpsertSeriesForm } from "../../components/form/UpsertSeriesForm.js";
import { UpsertSeriesGameForm } from "../../components/form/UpsertSeriesGameForm.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { SeriesSettingsToolbar } from "../../components/toolbar/SeriesSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import * as SeriesModelLib from "../../libs/models/Series.js";
import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: Awaited<ReturnType<typeof SeriesModelLib.findGroups>>;
	series: Prisma.SeriesGetPayload<null>;
	games: Prisma.GameGetPayload<null>[];
	seriesGames: Prisma.SeriesGameGetPayload<null>[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const pageTitle = "Edit " + options.series.name;

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
		
						UpsertSeriesForm(options.series),

						Header(2, "Series games"),

						options.seriesGames.map((seriesGame) => Block(UpsertSeriesGameForm(
							{
								games: options.games,
								series: options.series,
								seriesGame,
							}))),

						Block(UpsertSeriesGameForm(
							{
								games: options.games,
								series: options.series,
								seriesGame: null,
							})),
					]),
			}),
	};
}