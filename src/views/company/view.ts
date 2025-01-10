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
	company: Prisma.CompanyGetPayload<null>;
	gamesDeveloped: Prisma.GameGetPayload<null>[];
	gamesPublished: Prisma.GameGetPayload<null>[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const pageTitle = "Edit " + options.company.name;

	return {
		currentPage: "companies",
		pageTitle,
		content: Wrapper("45rem",
			[
				Breadcrumbs(
					[
						{ href: "/companies", text: "Companies" },
						{ href: "/companies/view/" + options.company.id, text: options.company.name },
					]),

				Header(1, pageTitle),

				Button(
					{
						style: "success",
						href: "/companies/edit/" + options.company.id,
						iconName: "fa-solid fa-pen-to-square",
						text: "Edit company",
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
	};
}