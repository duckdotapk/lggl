//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../_shared/instances/prismaClient.js";

import { Library } from "../components/Library.js";

import { ServerFritterContext } from "../instances/server.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/",
	handler: async (context) =>
	{
		const games = await prismaClient.game.findMany();

		const selectedGame = games[0] ?? null;

		context.fritterResponse.setContentType("text/html");
		context.fritterResponse.setBody(Library(games, selectedGame).renderToString());
	},
};