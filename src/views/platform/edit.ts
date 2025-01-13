//
// Imports
//

import { Prisma } from "@prisma/client";

import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { UpsertPlatformForm } from "../../components/form/UpsertPlatformForm.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

type ViewOptions =
{
	platform: Prisma.PlatformGetPayload<null>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const pageTitle = "Edit " + options.platform.name;

	return {
		currentPage: "platforms",
		pageTitle,
		content: Wrapper("45rem",
			[
				Breadcrumbs(
					[
						{ href: "/platforms", text: "Platforms" },
						{ href: "/platforms/view/" + options.platform.id, text: options.platform.name },
						{ href: "/platforms/edit/" + options.platform.id, text: "Edit" },
					]),

				Header(1, pageTitle),

				UpsertPlatformForm(options.platform),
			]),
	};
}