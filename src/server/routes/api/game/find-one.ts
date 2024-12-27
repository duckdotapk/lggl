//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";

import { prismaClient } from "../../../../_shared/instances/prismaClient.js";

import { ServerFritterContext } from "../../../instances/server.js";

import * as Schemas from "./find-one.schemas.js";

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
						gameAntiCheats:
						{
							include:
							{
								antiCheat: true,
							},
						},
						gameDevelopers:
						{
							include:
							{
								company: true,
							},
						},
						gameDrms:
						{
							include:
							{
								drm: true,
							},
						},
						gameEngines:
						{
							include:
							{
								engine:
								{
									include:
									{
										engineCompanies:
										{
											include:
											{
												company: true,
											},
										},
									},
								},
							},
						},
						gameGenres:
						{
							include:
							{
								genre: true,
							},
						},
						gameInstallations: true,
						gameModes:
						{
							include:
							{
								mode: true,
							},
						},
						gamePlatforms:
						{
							include:
							{
								platform: true,
							},
						},
						gamePublishers:
						{
							include:
							{
								company: true,
							},
						},
						gameSources:
						{
							include:
							{
								source: true,
							},
						},
						seriesGames:
						{
							include:
							{
								series: true,
							},
						},
					},
				});

			if (game == null)
			{
				throw new FritterApiUtilities.APIError({ code: "NOT_FOUND", message: "Game not found." });
			}

			return {
				success: true,
				game,
			};
		},
	});