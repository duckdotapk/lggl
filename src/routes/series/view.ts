//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as SeriesModelLib from "../../libs/models/Series.js";

import { view } from "../../views/series/view.js";

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

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/series/view/:seriesId",
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
		
		const groupManager = await SeriesModelLib.findGroups(prismaClient,
			{
				settings: context.settings,
				selectedSeries: series,
			});

		const games = await prismaClient.game.findMany(
			{
				where:
				{
					seriesGames:
					{
						some:
						{
							series_id: seriesId,
						},
					},
				},
				orderBy:
				[
					{ sortName: "asc" },
				],
			});

		context.renderComponent(view(
			{
				settings: context.settings,
				groupManager,
				series,
				games,
			}));
	},
};