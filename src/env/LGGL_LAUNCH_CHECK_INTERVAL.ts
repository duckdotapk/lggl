//
// Imports
//

import "./_load.js";

import { z } from "zod";

//
// Environment Variable
//

export const LGGL_LAUNCH_CHECK_INTERVAL = z
	.coerce
	.number()
	.min(1)
	.default(2000)
	.parse(process.env["LGGL_LAUNCH_CHECK_INTERVAL"]);