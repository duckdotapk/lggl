//
// Schemas
//

import { z } from "zod";

export const FilterOptionsSchema = z.object(
	{
		groupMode: z.enum([ "lastPlayed" ]),
		sortMode: z.enum([ "lastPlayed" ]),

		groupFavoritesSeparately: z.boolean(),

		showVisibleGames: z.boolean(),
		showHiddenGames: z.boolean(),
		showNsfwGames: z.boolean(),
	});

//
// Types
//

export type FilterOptions = z.infer<typeof FilterOptionsSchema>;