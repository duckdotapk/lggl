//
// Imports
//

import "./_load.js";

import { z } from "zod";

//
// Environment Variable
//

export const LGGL_LAUNCH_MAX_TRACKING_ATTEMPTS = z
	.coerce
	.number()
	.min(1)
	.default(20)
	.parse(process.env["LGGL_LAUNCH_MAX_TRACKING_ATTEMPTS"]);