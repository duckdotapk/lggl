//
// Imports
//

import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { UpsertEngineForm } from "../../components/form/UpsertEngineForm.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

export function view(): Partial<SiteOptions>
{
	return {
		currentPage: "engines",
		pageTitle: "Create engine",
		content: Wrapper("45rem",
			[
				Breadcrumbs(
					[
						{ href: "/engines", text: "Engines" },
						{ href: "/engines/create", text: "Create" },
					]),

				Header(1, "Create engine"),

				UpsertEngineForm(null),
			]),
	};
}