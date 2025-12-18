//
// Imports
//

import { GamePlayActionType } from "@prisma/client";
import { z } from "zod";

import { ErrorResponseBodySchema, SuccessResponseBodySchema } from "../../../libs/Api.client.js";

//
// Schema
//

export const method = "POST";

export const path = "/api/gamePlayActions/update";

export const RequestBodySchema = z.object(
{
	id: z.number().int().min(1),
	updateData: z.object(
	{
		name: z.string(),
		type: z.custom<GamePlayActionType>(),
		path: z.string(),
		workingDirectory: z.string().nullable(),
		additionalArguments: z.string().nullable(),
		processRequirements: z.string().nullable(),
		isArchived: z.boolean(),
	}).partial(),
});

export const ResponseBodySchema = z.union(
[
	SuccessResponseBodySchema,
	ErrorResponseBodySchema,
]);