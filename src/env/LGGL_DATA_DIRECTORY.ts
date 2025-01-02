//
// Imports
//

import "./_load.js";

import path from "node:path";

import { z } from "zod";

//
// Environment Variable
//

export const LGGL_DATA_DIRECTORY = z
	.string()
	.default(path.join(import.meta.dirname, "..", "..", "data"))
	.parse(process.env["LGGL_DATA_DIRECTORY"]);