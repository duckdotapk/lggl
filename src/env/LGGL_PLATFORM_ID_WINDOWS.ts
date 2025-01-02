//
// Imports
//

import "./_load.js";

import { z } from "zod";

//
// Environment Variable
//

export const LGGL_PLATFORM_ID_WINDOWS = z
	.coerce
	.number()
	.min(1)
	.parse(process.env["LGGL_PLATFORM_ID_WINDOWS"]);