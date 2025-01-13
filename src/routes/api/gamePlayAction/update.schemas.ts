//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";
import { z } from "zod";

import * as GamePlayActionSchemaLib from "../../../libs/schemas/GamePlayAction.js";

//
// Schemas
//

export const RequestBodySchema = z.object(
	{
		id: z.number().int().min(1),
		
		updateData: z.object(
			{
				name: z.string(),
				type: GamePlayActionSchemaLib.TypeSchema,
				path: z.string(),
				trackingPath: z.string(),
				argumentsJson: z.string(),
				isArchived: z.boolean(),
			}).partial(),
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

export const path = "/api/gamePlayActions/update";

//
// Utility Functions
//

export function updateGamePlayAction(id: number, updateData: RequestBody["updateData"])
{
	return FritterApiUtilities.request(method, path,
		{
			requestBodySchema: RequestBodySchema,
			responseBodySchema: ResponseBodySchema,
			requestBody:
			{
				id,
				updateData,
			},
		});
}