//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";
import { z } from "zod";

import * as GameCompanySchemaLib from "../../../libs/schemas/GameCompany.js";

//
// Schemas
//

export const RequestBodySchema = z.object(
	{
		id: z.number().int().min(1),
		
		updateData: z.object(
			{
				notes: z.string().nullable(),
				type: GameCompanySchemaLib.TypeSchema,

				company_id: z.number().int(),
			}).partial(),
	});

export const ResponseBodySchema = z.union(
	[
		FritterApiUtilities.SuccessResponseBodySchema,

		FritterApiUtilities.ErrorResponseBodySchema,
	]);

//
// Types
//

export type RequestBody = z.infer<typeof RequestBodySchema>;
	
export type ResponseBody = z.infer<typeof ResponseBodySchema>;

//
// Constants
//

export const method = "POST";

export const path = "/api/gameCompanies/update";

//
// Utility Functions
//

export function updateGameCompany(id: number, updateData: RequestBody["updateData"])
{
	return FritterApiUtilities.request(method, path,
		{
			requestBodySchema: RequestBodySchema,
			responseBodySchema: ResponseBodySchema,
			requestBody:
			{
				id,
				updateData,
			},
		});
}