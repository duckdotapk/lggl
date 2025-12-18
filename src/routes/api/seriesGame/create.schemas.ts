//
// Imports
//

import { z } from "zod";

import { ErrorResponseBodySchema, SuccessResponseBodySchema } from "../../../libs/Api.client.js";

//
// Schema
//

export const method = "POST";

export const path = "/api/seriesGames/create";

export const RequestBodySchema = z.object(
{
	number: z.number().int(),

	series_id: z.number().int(),
	game_id: z.number().int(),
});

export const ResponseBodySchema = z.union(
[
	SuccessResponseBodySchema,
	ErrorResponseBodySchema,
]);