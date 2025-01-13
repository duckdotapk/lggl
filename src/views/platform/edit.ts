//
// Imports
//

import { Prisma } from "@prisma/client";

import { Header } from "../../components/basic/Header.js";

import { UpsertPlatformForm } from "../../components/form/UpsertPlatformForm.js";

import { ListLayout, ListLayoutOptions } from "../../components/layout/ListLayout.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

type ViewOptions =
{
	groups: ListLayoutOptions["groups"];
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
				groups: options.groups,
				createHref: "/platforms/create",
				content: Wrapper("45rem",
					[
						Header(1, pageTitle),
		
						UpsertPlatformForm(options.platform),
					]),
			}),
	};
}