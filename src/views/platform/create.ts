//
// Imports
//

import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { UpsertPlatformForm } from "../../components/form/UpsertPlatformForm.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

export function view(): Partial<SiteOptions>
{
	return {
		currentPage: "platforms",
		pageTitle: "Create platform",
		content: Wrapper("45rem",
			[
				Breadcrumbs(
					[
						{ href: "/platforms", text: "Platforms" },
						{ href: "/platforms/create", text: "Create" },
					]),

				Header(1, "Create platform"),

				UpsertPlatformForm(null),
			]),
	};
}