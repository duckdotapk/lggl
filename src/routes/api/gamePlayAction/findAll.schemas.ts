//
// Imports
//

import { z } from "zod";

import { ErrorResponseBodySchema, SuccessResponseBodySchema } from "../../../libs/Api.client.js";

//
// Schema
//

export const method = "GET";

export const path = "/api/gamePlayActions/findAll";

export const RequestBodySchema = z.object(
{
	game_id: z.number().int().min(1),
});

export const ResponseBodySchema = z.union(
[
	SuccessResponseBodySchema.extend(
	{
		gamePlayActions: z.array(z.object(
		{
			id: z.number(),
			name: z.string(),
		})),
	}),
	ErrorResponseBodySchema,
]);