//
// Imports
//

import "./_load.js";

import { z } from "zod";

//
// Environment Variable
//

export const LGGL_STEAM_API_KEY = z
	.string()
	.parse(process.env["LGGL_STEAM_API_KEY"]);