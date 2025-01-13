//
// Imports
//

import { Header } from "../../components/basic/Header.js";

import { UpsertEngineForm } from "../../components/form/UpsertEngineForm.js";
import { ListLayout, ListLayoutOptions } from "../../components/layout/ListLayout.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

export type ViewOptions =
{
	groups: ListLayoutOptions["groups"];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "engines",
		pageTitle: "Create engine",
		content: ListLayout(
			{
				toolbar: null,
				groups: options.groups,
				createHref: "/engines/create",
				content: Wrapper("45rem",
					[
						Header(1, "Create engine"),
		
						UpsertEngineForm(null),
					]),
			}),
	};
}