//
// Imports
//

import { z } from "zod";

import { ErrorResponseBodySchema, SuccessResponseBodySchema } from "../../../libs/Api.client.js";

//
// Schema
//

export const method = "POST";

export const path = "/api/games/syncHistoricalPlaytime";

export const RequestBodySchema = z.object(
{
	id: z.number().int().min(1),
	
	// Note: This is an object to allow adding other providers via a union later
	provider: z.object(
	{
		name: z.literal("steam"),
		steamAppId: z.number().int().min(1),
		updateFirstPlayedDate: z.boolean(),
		updateLastPlayedDate: z.boolean(),
	}),
});

export const ResponseBodySchema = z.union(
[
	SuccessResponseBodySchema,
	ErrorResponseBodySchema,
]);