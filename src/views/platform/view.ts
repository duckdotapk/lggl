//
// Imports
//

import { Prisma } from "@prisma/client";

import { Anchor } from "../../components/basic/Anchor.js";
import { Block } from "../../components/basic/Block.js";
import { Header } from "../../components/basic/Header.js";

import { Button } from "../../components/input/Button.js";

import { ListLayout, ListLayoutOptions } from "../../components/layout/ListLayout.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

//
// View
//

type ViewOptions =
{
	groups: ListLayoutOptions["groups"];
	platform: Prisma.PlatformGetPayload<null>;
	games: Prisma.GameGetPayload<null>[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const pageTitle = options.platform.name;

	return {
		currentPage: "platforms",
		pageTitle,
		content: ListLayout(
			{
				toolbar: null,
				groups: options.groups,
				createHref: "/platforms/create",
				content: Wrapper("45rem",
					[		
						Header(1, pageTitle),
		
						Button(
							{
								style: "success",
								href: "/platforms/edit/" + options.platform.id,
								iconName: "fa-solid fa-pen-to-square",
								text: "Edit",
							}),
		
						options.games.length > 0
							? [
								Header(2, "Games on this platform"),
				
								// TODO: make a "grid" component that shows the game's cover art?
								options.games.map((game) => Block(Anchor(game.name, "/games/view/" + game.id))),
							]
							: null,
					]),
			}),
	};
}