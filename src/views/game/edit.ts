//
// Imports
//

import { Block } from "../../components/basic/Block.js";
import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { DownloadGameImagesForm } from "../../components/form/DownloadGameImagesForm.js";
import { SyncGameHistoricalPlayTimeForm } from "../../components/form/SyncGameHistoricalPlayTimeForm.js";
import { UpsertGameForm, UpsertGameFormGame } from "../../components/form/UpsertGameForm.js";
import { UpsertGameCompanyForm, UpsertGameCompanyFormOptions } from "../../components/form/UpsertGameCompanyForm.js";
import { UpsertGameEngineForm, UpsertGameEngineFormOptions } from "../../components/form/UpsertGameEngineForm.js";
import { UpsertGameInstallationForm, UpsertGameInstallationFormOptions } from "../../components/form/UpsertGameInstallationForm.js";
import { UpsertGamePlayActionForm, UpsertGamePlayActionFormOptions } from "../../components/form/UpsertGamePlayActionForm.js";

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
	gameInstallations: NonNullable<UpsertGameInstallationFormOptions["gameInstallation"]>[];
	gamePlayActions: NonNullable<UpsertGamePlayActionFormOptions["gamePlayAction"]>[];
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

				Header(2, "Game"),

				UpsertGameForm(options.game),

				Header(2, "Game companies"),

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

				Header(2, "Game engines"),

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

				Header(2, "Game installations"),

				options.gameInstallations.map((gameInstallation) => Block(UpsertGameInstallationForm(
					{
						game: options.game,
						gameInstallation,
					}))),

				Block(UpsertGameInstallationForm(
					{
						game: options.game,
						gameInstallation: null,
					})),

				Header(2, "Game play actions"),

				options.gamePlayActions.map((gamePlayAction) => Block(UpsertGamePlayActionForm(
					{
						game: options.game, 
						gamePlayAction,
					}))),

				Block(UpsertGamePlayActionForm(
					{
						game: options.game,
						gamePlayAction: null,
					})),

				Header(2, "Utilities"),

				Block(
					[
						Header(3, "Download images from Steam"),

						DownloadGameImagesForm(options.game),
					]),

				Block(
					[
						Header(3, "Sync historical play time from Steam"),

						SyncGameHistoricalPlayTimeForm(options.game),
					]),
			]),
	};
}