//
// Imports
//

import { DE } from "@donutteam/document-builder";
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
	platforms: Prisma.PlatformGetPayload<null>[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "platforms",
		pageTitle: "Platforms",
		content: Wrapper("45rem",
			[
				Breadcrumbs(
					[
						{ href: "/platforms", text: "Platforms" },
					]),

				Header(1, "Platforms"),

				Button(
					{
						href: "/platforms/create",
						style: "success",
						iconName: "fa-solid fa-plus",
						text: "Create",
					}),

				options.platforms.map((platform) => Block(Anchor([ new DE("span", platform.iconName + " fa-fw"), " ", platform.name ], "/platforms/view/" + platform.id)))
			]),
	};
}