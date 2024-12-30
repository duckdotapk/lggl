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
		const searchParameters = context.fritterRequest.getSearchParams();
		
		let selectedGameId: number | null = parseInt(searchParameters.get("selectedGameId") ?? "");

		if (selectedGameId != null && isNaN(selectedGameId))
		{
			selectedGameId = null;
		}

		const games = await prismaClient.game.findMany(
			{
				where:
				{
					isHidden: false,
					isNsfw: false,
				},
				orderBy:
				[
					{
						isFavorite: "desc",
					},
					{
						lastPlayedDate:
						{
							sort: "desc",
							nulls: "last",
						},
					},
				],
			});

		const selectedGame = selectedGameId != null
			? (games.find((game) => game.id === selectedGameId) ?? null)
			: null;

		context.fritterResponse.setContentType("text/html");
		context.fritterResponse.setBody(Library(games, selectedGame, searchParameters).renderToString());
	},
};