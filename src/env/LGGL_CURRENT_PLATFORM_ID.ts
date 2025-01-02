//
// Imports
//

import "./_load.js";

import { z } from "zod";

//
// Environment Variable
//

export const LGGL_CURRENT_PLATFORM_ID = z
	.coerce
	.number()
	.min(1)
	.parse(process.env["LGGL_CURRENT_PLATFORM_ID"]);