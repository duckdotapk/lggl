//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";
import { Prisma } from "@prisma/client";
import { z } from "zod";

//
// Schemas
//

export const RequestBodySchema = z.object(
	{
		gameId: z.number().int().min(1),
	});

export const ResponseBodySchema = z.union(
	[
		FritterApiUtilities.SuccessResponseBodySchema.extend(
			{
				game: z.custom<Prisma.GameGetPayload<
					{
						include:
						{
							gameAntiCheats:
							{
								include:
								{
									antiCheat: true;
								};
							};
							gameDevelopers:
							{
								include:
								{
									company: true;
								};
							};
							gameDrms:
							{
								include:
								{
									drm: true;
								};
							};
							gameEngines:
							{
								include:
								{
									engine: true;
								};
							};
							gameGenres:
							{
								include:
								{
									genre: true;
								};
							};
							gameModes:
							{
								include:
								{
									mode: true;
								};
							};
							gamePlatforms:
							{
								include:
								{
									platform: true;
								};
							};
							gamePublishers:
							{
								include:
								{
									company: true;
								};
							};
							gameRatingBoardRatings:
							{
								include:
								{
									ratingBoardRating:
									{
										include:
										{
											ratingBoard: true;
										};
									};
								};
							};
							gameSources:
							{
								include:
								{
									source: true;
								};
							};
							installations: true;
							seriesGames:
							{
								include:
								{
									series: true;
								};
							};
						};
					}>>(),
			}),

		FritterApiUtilities.ErrorResponseBodySchema,
	]);

//
// Types
//

export type RequestBody = z.infer<typeof RequestBodySchema>;
	
export type ResponseBody = z.infer<typeof ResponseBodySchema>;

//
// Constants
//

export const method = "GET";

export const path = "/api/games/find-one";

//
// Utility Functions
//

export function findGame(gameId: number)
{
	return FritterApiUtilities.request(method, path,
		{
			requestBodySchema: RequestBodySchema,
			responseBodySchema: ResponseBodySchema,
			requestBody:
			{
				gameId,
			},
		});
}