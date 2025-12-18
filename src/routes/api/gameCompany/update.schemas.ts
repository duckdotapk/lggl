//
// Imports
//

import { GameCompanyType } from "@prisma/client";
import { z } from "zod";

import { ErrorResponseBodySchema, SuccessResponseBodySchema } from "../../../libs/Api.client.js";

//
// Schema
//

export const method = "POST";

export const path = "/api/gameCompanies/update";

export const RequestBodySchema = z.object(
{
	id: z.number().int().min(1),
	
	updateData: z.object(
		{
			notes: z.string().nullable(),
			type: z.custom<GameCompanyType>(),

			company_id: z.number().int(),
		}).partial(),
});

export const ResponseBodySchema = z.union(
[
	SuccessResponseBodySchema,
	ErrorResponseBodySchema,
]);