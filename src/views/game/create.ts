//
// Imports
//

import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { UpsertGameForm } from "../../components/form/UpsertGameForm.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

export function view(): Partial<SiteOptions>
{
	return {
		currentPage: "games/create",
		pageTitle: "Create game",
		content: Wrapper("45rem",
			[
				Breadcrumbs(
					[
						{ href: "/games", text: "Games" },
						{ href: "/games/create", text: "Create" },
					]),

				Header(1, "Create game"),

				UpsertGameForm(null),
			]),
	};
}