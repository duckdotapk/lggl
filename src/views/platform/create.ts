//
// Imports
//

import { Header } from "../../components/basic/Header.js";

import { UpsertPlatformForm } from "../../components/form/UpsertPlatformForm.js";

import { ListLayout, ListLayoutOptions } from "../../components/layout/ListLayout.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

export type ViewOptions =
{
	groups: ListLayoutOptions["groups"];
}

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "platforms",
		pageTitle: "Create platform",
		content: ListLayout(
			{
				toolbar: null,
				groups: options.groups,
				createHref: "/platforms/create",
				content: Wrapper("45rem",
					[
						Header(1, "Create platform"),
		
						UpsertPlatformForm(null),
					]),
			}),
	};
}