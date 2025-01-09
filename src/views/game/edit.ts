//
// Imports
//

import { DE } from "@donutteam/document-builder";

import { Anchor } from "../../components/basic/Anchor.js";
import { Header } from "../../components/basic/Header.js";

import { Muted } from "../../components/basic/Muted.js";

import { UpsertGameForm, UpsertGameFormGame } from "../../components/form/UpsertGameForm.js";
import { UpsertGameCompanyForm, UpsertGameCompanyFormOptions } from "../../components/form/UpsertGameCompanyForm.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import * as SettingModelLib from "../../libs/models/Setting.js";
import { TabControl } from "../../components/input/TabControl.js";

//
// View
//

export type ViewOptions =
{
	settings: SettingModelLib.Settings;
	companies: UpsertGameCompanyFormOptions["companies"];
	game: NonNullable<UpsertGameFormGame>;
	gameCompanies: NonNullable<UpsertGameCompanyFormOptions["gameCompany"]>[];
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: null,
		pageTitle: "Edit " + options.game.name,
		content: Wrapper("45rem",
			[
				Muted(Anchor([ new DE("span", "fa-solid fa-arrow-left"), " Back to game" ], "/games/view/" + options.game.id)),

				Header(1, "Edit " + options.game.name),

				Header(2, "Game #" + options.game.id),

				UpsertGameForm(options.game),

				Header(2, "Related data"),

				TabControl(
					[
						{
							title: "Companies",
							content:
							[				
								options.gameCompanies.map((gameCompany) =>
									[
										Header(3, "Game company #" + gameCompany.id),
				
										UpsertGameCompanyForm(
											{
												companies: options.companies, 
												game: options.game,
												gameCompany,
											}),
									]),

								Header(3, "Add new game company"),
					
								UpsertGameCompanyForm(
									{
										companies: options.companies,
										game: options.game,
										gameCompany: null,
									}),
							],
						},
						{
							title: "Engines",
							content: [],
						},
						{
							title: "Genres",
							content: [],
						},
						{
							title: "Installations",
							content: [],
						},
						{
							title: "Links",
							content: [],
						},
						{
							title: "Modes",
							content: [],
						},
						{
							title: "Platforms",
							content: [],
						},
						{
							title: "Play actions",
							content: [],
						},
						{
							title: "Play sessions",
							content: [],
						},
					]),
			]),
	};
}