//
// Imports
//

import { Block } from "../../components/basic/Block.js";
import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { DownloadGameImagesForm } from "../../components/form/DownloadGameImagesForm.js";
import { SyncGameHistoricalPlayTimeForm } from "../../components/form/SyncGameHistoricalPlayTimeForm.js";
import { UpsertGameForm } from "../../components/form/UpsertGameForm.js";
import { UpsertGameCompanyForm } from "../../components/form/UpsertGameCompanyForm.js";
import { UpsertGameEngineForm } from "../../components/form/UpsertGameEngineForm.js";
import { UpsertGameInstallationForm } from "../../components/form/UpsertGameInstallationForm.js";
import { UpsertGameLinkForm } from "../../components/form/UpsertGameLinkForm.js";
import { UpsertGamePlatformForm } from "../../components/form/UpsertGamePlatformForm.js";
import { UpsertGamePlayActionForm } from "../../components/form/UpsertGamePlayActionForm.js";

import { TabControl } from "../../components/input/TabControl.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { GameSettingsToolbar } from "../../components/toolbar/GameSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import { createGameGroupManager } from "../../libs/models/Game.js";
import { Settings } from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: Settings;
	groupManager: Awaited<ReturnType<typeof createGameGroupManager>>;
	companies: Parameters<typeof UpsertGameCompanyForm>[0];
	engines: Parameters<typeof UpsertGameEngineForm>[0];
	game: NonNullable<Parameters<typeof UpsertGameForm>[0]>;
	gameCompanies: NonNullable<Parameters<typeof UpsertGameCompanyForm>[2]>[];
	gameEngines: NonNullable<Parameters<typeof UpsertGameEngineForm>[2]>[];
	gameInstallations: NonNullable<Parameters<typeof UpsertGameInstallationForm>[1]>[];
	gameLinks: NonNullable<Parameters<typeof UpsertGameLinkForm>[1]>[];
	gamePlatforms: NonNullable<Parameters<typeof UpsertGamePlatformForm>[2]>[];
	gamePlayActions: NonNullable<Parameters<typeof UpsertGamePlayActionForm>[1]>[];
	platforms: Parameters<typeof UpsertGamePlatformForm>[0];
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
								options.companies, 
								options.game,
								gameCompany,
							))),
				
							Block(UpsertGameCompanyForm(
								options.companies,
								options.game,
								null,
							)),
						],
					},
					{
						title: "Engines",
						content:
						[
							options.gameEngines.map((gameEngine) => Block(UpsertGameEngineForm(
								options.engines,
								options.game,
								gameEngine,
							))),
				
							Block(UpsertGameEngineForm(
								options.engines,
								options.game,
								null,
							)),
						],
					},
					{
						title: "Installations",
						content:
						[
							options.gameInstallations.map((gameInstallation) => Block(UpsertGameInstallationForm(
								options.game,
								gameInstallation,
							))),
			
							Block(UpsertGameInstallationForm(options.game, null)),
						],
					},
					{
						title: "Links",
						content:
						[
							options.gameLinks.map((gameLink) => Block(UpsertGameLinkForm(
								options.game,
								gameLink,
							))),
			
							Block(UpsertGameLinkForm(
								options.game,
								null,
							)),
						],
					},
					{
						title: "Platforms",
						content:
						[
							options.gamePlatforms.map((gamePlatform) => Block(UpsertGamePlatformForm(
								options.platforms,
								options.game,
								gamePlatform,
							))),
			
							Block(UpsertGamePlatformForm(
								options.platforms,
								options.game,
								null,
							)),
						],
					},
					{
						title: "Play actions",
						content:
						[
							options.gamePlayActions.map((gamePlayAction) => Block(UpsertGamePlayActionForm(
								options.game, 
								gamePlayAction,
							))),
			
							Block(UpsertGamePlayActionForm(options.game, null)),
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