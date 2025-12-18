//
// Imports
//

import { z } from "zod";

import { ErrorResponseBodySchema, SuccessResponseBodySchema } from "../../../libs/Api.client.js";

//
// Schema
//

export const method = "POST";

export const path = "/api/gameEngines/create";

export const RequestBodySchema = z.object(
{
	notes: z.string().nullable(),
	version: z.string().nullable(),

	engine_id: z.number().int(),
	game_id: z.number().int(),
});

export const ResponseBodySchema = z.union(
[
	SuccessResponseBodySchema,

	ErrorResponseBodySchema,
]);