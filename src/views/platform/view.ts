//
// Imports
//

import { Prisma } from "@prisma/client";

import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";
import { Button } from "../../components/input/Button.js";
import { Block } from "../../components/basic/Block.js";
import { Anchor } from "../../components/basic/Anchor.js";

//
// View
//

type ViewOptions =
{
	platform: Prisma.PlatformGetPayload<null>;
	games: Prisma.GameGetPayload<null>[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const pageTitle = options.platform.name;

	return {
		currentPage: "platforms",
		pageTitle,
		content: Wrapper("45rem",
			[
				Breadcrumbs(
					[
						{ href: "/platforms", text: "Platforms" },
						{ href: "/platforms/view/" + options.platform.id, text: options.platform.name },
					]),

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
	};
}