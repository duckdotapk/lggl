//
// Imports
//

import "./_load.js";

import { z } from "zod";

//
// Environment Variable
//

export const LGGL_DEVELOPER_MODE = z
	.enum([ "true", "false" ])
	.transform((value) => value == "true")
	.parse(process.env["LGGL_DEVELOPER_MODE"]);