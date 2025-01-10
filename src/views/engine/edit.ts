//
// Imports
//

import { Prisma } from "@prisma/client";

import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { UpsertEngineForm } from "../../components/form/UpsertEngineForm.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

type ViewOptions =
{
	engine: Prisma.EngineGetPayload<null>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const pageTitle = "Edit " + (options.engine.shortName ?? options.engine.name);

	return {
		currentPage: "engines",
		pageTitle,
		content: Wrapper("45rem",
			[
				Breadcrumbs(
					[
						{ href: "/engines", text: "Engines" },
						{ href: "/engines/view/" + options.engine.id, text: options.engine.shortName ?? options.engine.name },
						{ href: "/engines/edit/" + options.engine.id, text: "Edit" },
					]),

				Header(1, pageTitle),

				UpsertEngineForm(options.engine),
			]),
	};
}