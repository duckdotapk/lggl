//
// Imports
//

import child_process from "node:child_process";

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";

import { prismaClient } from "../../../../_shared/instances/prismaClient.js";

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
						gameInstallations: true,
					},
				});

			if (game == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Game not found." });
			}

			if (!game.isInstalled)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_INSTALLED", message: "Game is not installed." });
			}

			if (game.steamApp == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_IMPLEMENTED", message: "Launching non-Steam games is not supported yet." });
			}

			// TODO: this will NOT work on Linux or macOS
			const command = `start "" "steam://rungameid/${game.steamApp}"`;

			try
			{
				await new Promise<void>(
					(resolve, reject) =>
					{
						child_process.exec(command, (error) => error != null ? reject(error) : resolve);
					});
			}
			catch (error)
			{
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