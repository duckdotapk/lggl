//
// Imports
//

import { z } from "zod";

import { ErrorResponseBodySchema, SuccessResponseBodySchema } from "../../../libs/Api.client.js";

//
// Schema
//

export const method = "POST";

export const path = "/api/platforms/update";

export const RequestBodySchema = z.object(
{
	id: z.number().int().min(1),
	
	updateData: z.object(
	{
		iconName: z.string(),
		name: z.string(),
	}).partial(),
});

export const ResponseBodySchema = z.union(
[
	SuccessResponseBodySchema,
	ErrorResponseBodySchema,
]);