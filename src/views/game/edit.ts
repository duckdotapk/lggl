//
// Imports
//

import { Block } from "../../components/basic/Block.js";
import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { TabControl } from "../../components/input/TabControl.js";

import { UpsertGameForm, UpsertGameFormGame } from "../../components/form/UpsertGameForm.js";
import { UpsertGameCompanyForm, UpsertGameCompanyFormOptions } from "../../components/form/UpsertGameCompanyForm.js";
import { UpsertGameEngineForm, UpsertGameEngineFormOptions } from "../../components/form/UpsertGameEngineForm.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";


//
// View
//

export type ViewOptions =
{
	companies: UpsertGameCompanyFormOptions["companies"];
	engines: UpsertGameEngineFormOptions["engines"];
	game: NonNullable<UpsertGameFormGame>;
	gameCompanies: NonNullable<UpsertGameCompanyFormOptions["gameCompany"]>[];
	gameEngines: NonNullable<UpsertGameEngineFormOptions["gameEngine"]>[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "games",
		pageTitle: "Edit " + options.game.name,
		content: Wrapper("45rem",
			[
				Breadcrumbs(
					[
						{ href: "/games", text: "Games" },
						{ href: "/games/view/" + options.game.id, text: options.game.name },
						{ href: "/games/edit/" + options.game.id, text: "Edit" },
					]),

				Header(1, "Edit " + options.game.name),

				UpsertGameForm(options.game),

				TabControl(
					[
						{
							title: "Companies",
							content:
							[				
								options.gameCompanies.map((gameCompany) => Block(UpsertGameCompanyForm(
									{
										companies: options.companies, 
										game: options.game,
										gameCompany,
									}))),
					
								Block(UpsertGameCompanyForm(
									{
										companies: options.companies,
										game: options.game,
										gameCompany: null,
									})),
							],
						},
						{
							title: "Engines",
							content:
							[
								options.gameEngines.map((gameEngine) => Block(UpsertGameEngineForm(
									{
										engines: options.engines,
										game: options.game,
										gameEngine,
									}))),
					
								Block(UpsertGameEngineForm(
									{
										engines: options.engines,
										game: options.game,
										gameEngine: null,
									})),
							],
						}
					]),
			]),
	};
}