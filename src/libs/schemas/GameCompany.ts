//
// Imports
//

import { z } from "zod";

//
// Schemas
//

export const TypeSchema = z.enum(
	[
		"DEVELOPER",
		"PUBLISHER",
	]);

//
// Types
//

export type Type = z.infer<typeof TypeSchema>;