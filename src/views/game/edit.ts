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
import { UpsertGameLinkForm, UpsertGameLinkFormOptions } from "../../components/form/UpsertGameLinkForm.js";
import { UpsertGamePlatformForm, UpsertGamePlatformFormOptions } from "../../components/form/UpsertGamePlatformForm.js";
import { UpsertGamePlayActionForm, UpsertGamePlayActionFormOptions } from "../../components/form/UpsertGamePlayActionForm.js";

import { TabControl } from "../../components/input/TabControl.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { GameSettingsToolbar } from "../../components/toolbar/GameSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import * as GameModelLib from "../../libs/models/Game.js";
import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: Awaited<ReturnType<typeof GameModelLib.findGroups>>;
	companies: UpsertGameCompanyFormOptions["companies"];
	engines: UpsertGameEngineFormOptions["engines"];
	game: NonNullable<UpsertGameFormGame>;
	gameCompanies: NonNullable<UpsertGameCompanyFormOptions["gameCompany"]>[];
	gameEngines: NonNullable<UpsertGameEngineFormOptions["gameEngine"]>[];
	gameInstallations: NonNullable<UpsertGameInstallationFormOptions["gameInstallation"]>[];
	gameLinks: NonNullable<UpsertGameLinkFormOptions["gameLink"]>[];
	gamePlatforms: NonNullable<UpsertGamePlatformFormOptions["gamePlatform"]>[];
	gamePlayActions: NonNullable<UpsertGamePlayActionFormOptions["gamePlayAction"]>[];
	platforms: UpsertGamePlatformFormOptions["platforms"];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "games",
		pageTitle: "Edit " + options.game.name,
		content: ListLayout(
			{
				toolbar: GameSettingsToolbar(options.settings),
				groupManager: options.groupManager,
				createHref: "/games/create",
				content: Wrapper(
					[		
						Breadcrumbs(
							[
								{
									href: "/games", 
									text: "Games", 
									pjaxSelector: "main",
								},
								{
									href: "/games/view/" + options.game.id, 
									text: options.game.name, 
									pjaxSelector: "main",
								},
								{
									href: "/games/edit/" + options.game.id, 
									text: "Edit",
									pjaxSelector: "main",
								},
							]),

						Header(1, "Edit Game"),
		
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
								},
								{
									title: "Installations",
									content:
									[
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
									],
								},
								{
									title: "Links",
									content:
									[
										options.gameLinks.map((gameLink) => Block(UpsertGameLinkForm(
											{
												game: options.game,
												gameLink,
											}))),
						
										Block(UpsertGameLinkForm(
											{
												game: options.game,
												gameLink: null,
											})),
									],
								},
								{
									title: "Platforms",
									content:
									[
										options.gamePlatforms.map((gamePlatform) => Block(UpsertGamePlatformForm(
											{
												platforms: options.platforms,
												game: options.game,
												gamePlatform,
											}))),
						
										Block(UpsertGamePlatformForm(
											{
												platforms: options.platforms,
												game: options.game,
												gamePlatform: null,
											})),
									],
								},
								{
									title: "Play actions",
									content:
									[
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
									],
								},
								{
									title: "Utilities",
									content:
									[
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
									],
								},
							]),
					]),
			}),
	};
}