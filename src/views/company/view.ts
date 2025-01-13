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
	company: Prisma.CompanyGetPayload<null>;
	gamesDeveloped: Prisma.GameGetPayload<null>[];
	gamesPublished: Prisma.GameGetPayload<null>[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const pageTitle = options.company.name;

	return {
		currentPage: "companies",
		pageTitle,
		content: ListLayout(
			{
				toolbar: null,
				groups: options.groups,
				createHref: "/companies/create",
				content: Wrapper("45rem",
					[
						Header(1, pageTitle),

						Button(
							{
								style: "success",
								href: "/companies/edit/" + options.company.id,
								iconName: "fa-solid fa-pen-to-square",
								text: "Edit",
							}),

						options.gamesDeveloped.length > 0
							? [
								Header(2, "Games developed"),
				
								// TODO: make a "grid" component that shows the game's cover art?
								options.gamesDeveloped.map((game) => Block(Anchor(game.name, "/games/view/" + game.id))),
							]
							: null,

						options.gamesPublished.length > 0
							? [
								Header(2, "Games published"),
				
								// TODO: make a "grid" component that shows the game's cover art?
								options.gamesPublished.map((game) => Block(Anchor(game.name, "/games/view/" + game.id))),
							]
							: null,
					]),
			}),
	};
}