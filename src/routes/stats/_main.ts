//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { shortEnglishHumanizer2 } from "../../instances/humanizer.js";
import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import { view, ViewOptions } from "../../views/stats/_main.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/stats",
	handler: async (context) =>
	{
		const games = await prismaClient.game.findMany();

		const stats: ViewOptions["stats"] = [];

		stats.push(
			{
				name: "Number of games",
				value: games.length.toString(),
			});

		stats.push(
			{
				name: "Total playtime",
				value: shortEnglishHumanizer2(games.reduce((total, game) => total + game.playTimeTotalSeconds, 0) * 1000),
			});

		context.renderComponent(view(
			{
				stats,
			}));
	},
};