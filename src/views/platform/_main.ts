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
	groupManager: GroupManager<Prisma.PlatformGetPayload<null>>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "platforms",
		pageTitle: "Platforms",
		content: ListLayout(
			{
				toolbar: null,
				groupManager: options.groupManager,
				createHref: "/platforms/create",
				content: null,
			}),
	};
}