//
// Imports
//

import { Prisma } from "@prisma/client";

import { Anchor } from "../../components/basic/Anchor.js";
import { Block } from "../../components/basic/Block.js";
import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { Button } from "../../components/input/Button.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

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
						text: "Create",
					}),


				options.engines.map((engine) => Block(Anchor(engine.shortName ?? engine.name, "/engines/view/" + engine.id))),
			]),
	};
}