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
		//
		// Get Parameters
		//

		const groupBy = context.fritterRequest.getSearchParams().get("groupBy");

		const searchParameters = context.fritterRequest.getSearchParams();
		
		let selectedGameId: number | null = parseInt(searchParameters.get("selectedGameId") ?? "");

		if (selectedGameId != null && isNaN(selectedGameId))
		{
			selectedGameId = null;
		}

		//
		// Find Games
		//

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
					{
						name: "asc",
					},
				],
			});

		//
		// Group Games
		//

		const gameGroups = new Map<string, typeof games>();

		switch (groupBy)
		{
			default:
				const favoriteGames = games.filter((game) => game.isFavorite);
				
				if (favoriteGames.length > 0)
				{
					gameGroups.set("Favorites", favoriteGames);
				}

				const playedGames = games.filter((game) => !game.isFavorite && game.playTimeTotalSeconds > 0);

				if (playedGames.length > 0)
				{
					gameGroups.set("Played Games", playedGames);
				}

				const unplayedGames = games.filter((game) => !game.isFavorite && game.playTimeTotalSeconds == 0);

				if (unplayedGames.length > 0)
				{
					gameGroups.set("Unplayed Games", unplayedGames);
				}

				break;
		}

		//
		// Sort Groups
		//

		// TODO

		//
		// Find Selected Game
		//

		const selectedGame = selectedGameId != null
			? await prismaClient.game.findFirst(
				{
					where:
					{
						id: selectedGameId,
					},
					include:
					{
						gamePlayActions: true,
					},
				})
			: null;

		//
		// Render Library
		//

		context.fritterResponse.setContentType("text/html");
		context.fritterResponse.setBody(Library(gameGroups, selectedGame, searchParameters).renderToString());
	},
};