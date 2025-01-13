//
// Imports
//

import { Prisma } from "@prisma/client";

import { GroupManager } from "../../classes/GroupManager.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { SiteOptions } from "../../components/Site.js";

//
// View
//

export type ViewOptions =
{
	groupManager: GroupManager<Prisma.EngineGetPayload<null>>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "engines",
		pageTitle: "Engines",
		content: ListLayout(
			{
				toolbar: null,
				groupManager: options.groupManager,
				createHref: "/engines/create",
				content: null,
			}),
	};
}