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
		game_id: z.number().int().min(1),
	});

export const ResponseBodySchema = z.union(
	[
		FritterApiUtilities.SuccessResponseBodySchema.extend(
			{
				gamePlayActions: z.array(z.object(
					{
						id: z.number(),
						name: z.string(),
					})),
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

export const method = "POST";

export const path = "/api/gamePlayActions/findAll";

//
// Utility Functions
//

export function findGamePlayActions(game_id: number)
{
	return FritterApiUtilities.request(method, path,
		{
			requestBodySchema: RequestBodySchema,
			responseBodySchema: ResponseBodySchema,
			requestBody:
			{
				game_id,
			},
		});
}