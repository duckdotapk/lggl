//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";
import { GamePlayActionType } from "@prisma/client";
import { z } from "zod";

//
// Schemas
//

export const RequestBodySchema = z.object(
	{
		name: z.string(),
		type: z.custom<GamePlayActionType>(),
		path: z.string(),
		workingDirectory: z.string().nullable(),
		additionalArguments: z.string().nullable(),
		processRequirements: z.string().nullable(),
		isArchived: z.boolean(),

		game_id: z.number().int(),
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

export const path = "/api/gamePlayActions/create";

//
// Utility Functions
//

export function createGamePlayAction(requestBody: RequestBody)
{
	return FritterApiUtilities.request(method, path,
		{
			requestBodySchema: RequestBodySchema,
			responseBodySchema: ResponseBodySchema,
			requestBody,
		});
}