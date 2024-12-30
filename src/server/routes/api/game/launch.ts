//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";

import { prismaClient } from "../../../../_shared/instances/prismaClient.js";

import * as GameLauncherLib from "../../../../_shared/libs/GameLauncher.js";

import { ServerFritterContext } from "../../../instances/server.js";

import * as Schemas from "./launch.schemas.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route = FritterApiUtilities.createEndpointRoute<RouteFritterContext, typeof Schemas.RequestBodySchema, typeof Schemas.ResponseBodySchema>(
	{
		method: Schemas.method,
		path: Schemas.path,
		middlewares: [],
		requestBodySchema: Schemas.RequestBodySchema,
		responseBodySchema: Schemas.ResponseBodySchema,
		handler: async (requestBody) =>
		{
			const game = await prismaClient.game.findUnique(
				{
					where:
					{
						id: requestBody.gameId,
					},
					include:
					{
						installations: true,
					},
				});

			if (game == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Game not found." });
			}

			try
			{
				await GameLauncherLib.launchGame(game);
			}
			catch (error)
			{
				console.error("[/api/games/launch] Error launching game:", error);

				throw new FritterApiUtilities.APIError(
					{ 
						code: "LAUNCH_FAILED", 
						message: error instanceof Error ? error.message : "Unknown error launching game.",
					});
			}

			return {
				success: true,
			};
		},
	});