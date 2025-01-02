//
// Imports
//

import "./_load.js";

import { z } from "zod";

//
// Environment Variable
//

export const LGGL_PORT = z
	.coerce
	.number()
	.min(1)
	.max(65535)
	.parse(process.env["LGGL_PORT"]);