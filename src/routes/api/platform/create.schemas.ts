//
// Imports
//

import { z } from "zod";

import { ErrorResponseBodySchema, SuccessResponseBodySchema } from "../../../libs/Api.client.js";

//
// Schema
//

export const method = "POST";

export const path = "/api/platforms/create";

export const RequestBodySchema = z.object(
{
	iconName: z.string(),
	name: z.string(),
});

export const ResponseBodySchema = z.union(
[
	SuccessResponseBodySchema.extend(
	{
		platform: z.object(
		{
			id: z.number(),
		}),
	}),
	ErrorResponseBodySchema,
]);