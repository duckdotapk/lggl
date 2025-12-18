//
// Imports
//

import { z } from "zod";

import { ErrorResponseBodySchema, SuccessResponseBodySchema } from "../../../libs/Api.client.js";

//
// Schema
//

export const method = "POST";

export const path = "/api/engines/create";

export const RequestBodySchema = z.object(
{
	name: z.string(),
	shortName: z.string().nullable(),
});

export const ResponseBodySchema = z.union(
[
	SuccessResponseBodySchema.extend(
	{
		engine: z.object(
		{
			id: z.number(),
		}),
	}),

	ErrorResponseBodySchema,
]);