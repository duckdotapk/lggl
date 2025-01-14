//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";
import { z } from "zod";

//
// Schemas
//

export const RequestBodySchema = z.object(
	{
		id: z.number().int().min(1),
	});

export const ResponseBodySchema = z.union(
	[
		FritterApiUtilities.SuccessResponseBodySchema.extend(
			{
				game: z.object(
					{
						id: z.number(),

						notes: z.string().nullable(),
					}),
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

export const path = "/api/games/findOne";

//
// Utility Functions
//

export function findGame(id: number)
{
	return FritterApiUtilities.request(method, path,
		{
			requestBodySchema: RequestBodySchema,
			responseBodySchema: ResponseBodySchema,
			requestBody:
			{
				id,
			},
		});
}