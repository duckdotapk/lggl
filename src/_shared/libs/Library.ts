//
// Schemas
//

import { z } from "zod";

export const FilterOptionsSchema = z.object(
	{
		groupMode: z.enum([ "name", "lastPlayed", "series" ]),

		showFavoritesGroup: z.boolean(),

		showVisibleGames: z.boolean(),
		showHiddenGames: z.boolean(),
		showNsfwGames: z.boolean(),
	});

//
// Types
//

export type FilterOptions = z.infer<typeof FilterOptionsSchema>;