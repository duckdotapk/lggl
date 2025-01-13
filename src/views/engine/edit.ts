//
// Imports
//

import { Prisma } from "@prisma/client";

import { GroupManager } from "../../classes/GroupManager.js";

import { Header } from "../../components/basic/Header.js";

import { UpsertEngineForm } from "../../components/form/UpsertEngineForm.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

type ViewOptions =
{
	groupManager: GroupManager<Prisma.EngineGetPayload<null>>;
	engine: Prisma.EngineGetPayload<null>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const engineName = options.engine.shortName ?? options.engine.name;

	return {
		currentPage: "engines",
		pageTitle: "Edit " + engineName + " | Engines",
		content: ListLayout(
			{
				toolbar: null,
				groupManager: options.groupManager,
				createHref: "/engines/create",
				content: Wrapper("45rem",
					[		
						Header(1, engineName),
		
						UpsertEngineForm(options.engine),
					]),
			}),
	};
}