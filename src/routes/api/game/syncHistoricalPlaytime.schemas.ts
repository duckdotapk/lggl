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
		
		// Note: This is an object to allow adding other providers via a union later
		provider: z.object(
			{
				name: z.literal("steam"),
				steamAppId: z.number().int().min(1),
				updateFirstPlayedDate: z.boolean(),
				updateLastPlayedDate: z.boolean(),
			}),
	});

export const ResponseBodySchema = z.union(
	[
		FritterApiUtilities.SuccessResponseBodySchema,

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

export const method = "POST";

export const path = "/api/games/syncHistoricalPlaytime";

//
// Utility Functions
//

export function syncHistoricalPlayTime(id: number, provider: RequestBody["provider"])
{
	return FritterApiUtilities.request(method, path,
		{
			requestBodySchema: RequestBodySchema,
			responseBodySchema: ResponseBodySchema,
			requestBody:
			{
				id,
				provider,
			},
		});
}