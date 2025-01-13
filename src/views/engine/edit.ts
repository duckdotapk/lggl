//
// Imports
//

import { Prisma } from "@prisma/client";

import { Header } from "../../components/basic/Header.js";

import { UpsertEngineForm } from "../../components/form/UpsertEngineForm.js";

import { ListLayout, ListLayoutOptions } from "../../components/layout/ListLayout.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

type ViewOptions =
{
	groups: ListLayoutOptions["groups"];
	engine: Prisma.EngineGetPayload<null>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const pageTitle = "Edit " + (options.engine.shortName ?? options.engine.name);

	return {
		currentPage: "engines",
		pageTitle,
		content: ListLayout(
			{
				toolbar: null,
				groups: options.groups,
				createHref: "/engines/create",
				content: Wrapper("45rem",
					[		
						Header(1, pageTitle),
		
						UpsertEngineForm(options.engine),
					]),
			}),
	};
}