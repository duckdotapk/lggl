//
// Imports
//
 
import { z } from "zod";

//
// Schemas
//

export const TypeSchema = z.enum(
	[
		"EXECUTABLE",
		"URL",
	]);

//
// Types
//

export type Type = z.infer<typeof TypeSchema>;