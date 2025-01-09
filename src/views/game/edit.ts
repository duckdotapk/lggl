//
// Imports
//

import { DE } from "@donutteam/document-builder";

import { Anchor } from "../../components/basic/Anchor.js";
import { Header } from "../../components/basic/Header.js";

import { Muted } from "../../components/basic/Muted.js";

import { UpsertGameForm, UpsertGameFormGame } from "../../components/form/UpsertGameForm.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: SettingModelLib.Settings;
	game: NonNullable<UpsertGameFormGame>;
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

				Header(2, "Game"),

				UpsertGameForm(options.game),

				Header(2, "Game companies"),

				Header(2, "Game engines"),

				Header(2, "Game genres"),

				Header(2, "Game installations"),

				Header(2, "Game links"),

				Header(2, "Game modes"),

				Header(2, "Game platforms"),

				Header(2, "Game play actions"),

				Header(2, "Game play sessions"),
			]),
	};
}