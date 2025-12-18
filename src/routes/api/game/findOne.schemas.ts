//
// Imports
//

import { z } from "zod";

import { ErrorResponseBodySchema, SuccessResponseBodySchema } from "../../../libs/Api.client.js";

//
// Schema
//

export const method = "GET";

export const path = "/api/games/findOne";

export const RequestBodySchema = z.object(
{
	id: z.number().int().min(1),
});

export const ResponseBodySchema = z.union(
[
	SuccessResponseBodySchema.extend(
	{
		game: z.object(
		{
			id: z.number(),
			notes: z.string().nullable(),
		}),
	}),

	ErrorResponseBodySchema,
]);