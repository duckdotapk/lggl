//
// Imports
//

import { Prisma } from "@prisma/client";

import { GroupManager } from "../../classes/GroupManager.js";

import { Anchor } from "../../components/basic/Anchor.js";
import { Block } from "../../components/basic/Block.js";
import { Header } from "../../components/basic/Header.js";

import { Button } from "../../components/input/Button.js";

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
	games: Prisma.GameGetPayload<null>[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const engineName = options.engine.shortName ?? options.engine.name;

	return {
		currentPage: "engines",
		pageTitle: engineName + " | Engines",
		content: ListLayout(
			{
				toolbar: null,
				groupManager: options.groupManager,
				createHref: "/engines/create",
				content: Wrapper("45rem",
					[		
						Header(1, engineName),
		
						Button(
							{
								style: "success",
								href: "/engines/edit/" + options.engine.id,
								iconName: "fa-solid fa-pen-to-square",
								text: "Edit",
							}),
		
						options.games.length > 0
							? [
								Header(2, "Games powered by"),
				
								// TODO: make a "grid" component that shows the game's cover art?
								options.games.map((game) => Block(Anchor(game.name, "/games/view/" + game.id))),
							]
							: null,
					]),
			}),
	};
}