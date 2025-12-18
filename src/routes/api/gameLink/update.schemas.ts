//
// Imports
//

import { z } from "zod";

import { ErrorResponseBodySchema, SuccessResponseBodySchema } from "../../../libs/Api.client.js";

//
// Schema
//

export const method = "POST";

export const path = "/api/gameLinks/update";

export const RequestBodySchema = z.object(
{
	id: z.number().int().min(1),
	updateData: z.object(
	{
		title: z.string(),
		url: z.url(),
	}).partial(),
});

export const ResponseBodySchema = z.union(
[
	SuccessResponseBodySchema,
	ErrorResponseBodySchema,
]);