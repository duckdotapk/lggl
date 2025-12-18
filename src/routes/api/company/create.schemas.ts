//
// Imports
//

import { z } from "zod";

import { ErrorResponseBodySchema, SuccessResponseBodySchema } from "../../../libs/Api.client.js";

//
// Schema
//

export const method = "POST";

export const path = "/api/companies/create";

export const RequestBodySchema = z.object(
{
	name: z.string(),
});

export const ResponseBodySchema = z.union(
[
	SuccessResponseBodySchema.extend(
	{
		company: z.object(
			{
				id: z.number(),
			}),
	}),
	ErrorResponseBodySchema,
]);