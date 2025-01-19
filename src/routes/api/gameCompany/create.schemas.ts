//
// Imports
//

import * as FritterApiUtilities from "@donutteam/fritter-api-utilities";
import { GameCompanyType } from "@prisma/client";
import { z } from "zod";

//
// Schemas
//

export const RequestBodySchema = z.object(
	{
		notes: z.string().nullable(),
		type: z.custom<GameCompanyType>(),

		company_id: z.number().int(),
		game_id: z.number().int(),
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

export const path = "/api/gameCompanies/create";

//
// Utility Functions
//

export function createGameCompany(requestBody: RequestBody)
{
	return FritterApiUtilities.request(method, path,
		{
			requestBodySchema: RequestBodySchema,
			responseBodySchema: ResponseBodySchema,
			requestBody,
		});
}