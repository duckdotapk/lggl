//
// Imports
//

import { RouterMiddleware } from "@lorenstuff/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import { createSeriesGroupManager } from "../../libs/models/Series.js";

import { view } from "../../views/series/edit.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext &
{
	routeParameters:
	{
		seriesId: string;
	};
};

export const route: RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/series/edit/:seriesId",
	handler: async (context) =>
	{
		const seriesId = parseInt(context.routeParameters.seriesId);
		if (isNaN(seriesId))
		{
			return;
		}

		const series = await prismaClient.series.findUnique(
		{
			where:
			{
				id: seriesId,
			},
		});
		if (series == null)
		{
			return;
		}

		const groupManager = await createSeriesGroupManager(prismaClient, context.settings, series);

		const games = await prismaClient.game.findMany(
		{
			orderBy:
			[
				{ sortName: "asc" },
			],
		});

		const seriesGames = await prismaClient.seriesGame.findMany(
		{
			where:
			{
				series_id: seriesId,
			},
			orderBy:
			[
				{ number: "asc" },
				{ game: { releaseDate: { sort: "asc", nulls: "last" } } },
				{ game: { sortName: "asc" } },
			],
		});

		context.renderComponent(view(
		{
			settings: context.settings,
			groupManager,
			series,
			games,
			seriesGames,
		}));
	},
};