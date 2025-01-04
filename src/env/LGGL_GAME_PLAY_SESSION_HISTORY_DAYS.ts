//
// Imports
//

import "./_load.js";

import { z } from "zod";

//
// Environment Variable
//

export const LGGL_GAME_PLAY_SESSION_HISTORY_DAYS = z
	.union(
		[
			z.coerce.number().min(1),
			z.literal("-1").transform(() => -1),
		])
	.parse(process.env["LGGL_GAME_PLAY_SESSION_HISTORY_DAYS"]);