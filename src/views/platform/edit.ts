//
// Imports
//

import { Prisma } from "@prisma/client";

import { GroupManager } from "../../classes/GroupManager.js";

import { Header } from "../../components/basic/Header.js";

import { UpsertPlatformForm } from "../../components/form/UpsertPlatformForm.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

type ViewOptions =
{
	groupManager: GroupManager<Prisma.PlatformGetPayload<null>>;
	platform: Prisma.PlatformGetPayload<null>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const pageTitle = "Edit " + options.platform.name;

	return {
		currentPage: "platforms",
		pageTitle,
		content: ListLayout(
			{
				toolbar: null,
				groupManager: options.groupManager,
				createHref: "/platforms/create",
				content: Wrapper("45rem",
					[
						Header(1, pageTitle),
		
						UpsertPlatformForm(options.platform),
					]),
			}),
	};
}