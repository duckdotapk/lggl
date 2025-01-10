//
// Imports
//

import { Prisma } from "@prisma/client";

import { Anchor } from "../../components/basic/Anchor.js";
import { Block } from "../../components/basic/Block.js";
import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { AutomaticColumns } from "../../components/layout/AutomaticColumns.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";
import { Button } from "../../components/input/Button.js";

//
// View
//

export type ViewOptions =
{
	engines: Prisma.EngineGetPayload<null>[];
}

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "engines",
		pageTitle: "Engines",
		content: Wrapper("45rem",
			[
				Breadcrumbs(
					[
						{ href: "/engines", text: "Engines" },
					]),

				Header(1, "Engines"),

				Button(
					{
						href: "/engines/create",
						style: "success",
						iconName: "fa-solid fa-plus",
						text: "Create engine",
					}),


				AutomaticColumns("14rem", options.engines.map((engine) => Block(Anchor(engine.shortName ?? engine.name, "/engines/view/" + engine.id))))
			]),
	};
}