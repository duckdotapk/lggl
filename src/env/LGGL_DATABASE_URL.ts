//
// Imports
//

import "./_load.js";

import path from "node:path";

import { z } from "zod";

import { LGGL_DATA_DIRECTORY } from "./LGGL_DATA_DIRECTORY.js";

//
// Environment Variable
//

export const LGGL_DATABASE_URL = z
	.string()
	.default("file:" + path.join(LGGL_DATA_DIRECTORY, "database.sqlite"))
	.parse(process.env["LGGL_DATABASE_URL"]);