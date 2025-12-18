//
// Imports
//

import { z } from "zod";

import { ErrorResponseBodySchema, SuccessResponseBodySchema } from "../../../libs/Api.client.js";

//
// Schema
//

export const method = "POST";

export const path = "/api/gameLinks/create";

export const RequestBodySchema = z.object(
{
	title: z.string(),
	url: z.string().url(),

	game_id: z.number().int(),
});

export const ResponseBodySchema = z.union(
[
	SuccessResponseBodySchema,

	ErrorResponseBodySchema,
]);