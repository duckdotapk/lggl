//
// Imports
//

import { z } from "zod";

import { ErrorResponseBodySchema, SuccessResponseBodySchema } from "../../../libs/Api.client.js";

//
// Schema
//

export const method = "POST";

export const path = "/api/gameEngines/update";

export const RequestBodySchema = z.object(
{
	id: z.number().int().min(1),
	
	updateData: z.object(
	{
		notes: z.string().nullable(),
		version: z.string().nullable(),

		engine_id: z.number().int(),
	}).partial(),
});

export const ResponseBodySchema = z.union(
[
	SuccessResponseBodySchema,
	ErrorResponseBodySchema,
]);