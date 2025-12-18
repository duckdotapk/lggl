//
// Imports
//

import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { UpsertEngineForm } from "../../components/form/UpsertEngineForm.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { EngineSettingsToolbar } from "../../components/toolbar/EngineSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import { createEngineGroupManager } from "../../libs/models/Engine.js";
import { Settings } from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: Settings;
	groupManager: Awaited<ReturnType<typeof createEngineGroupManager>>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "engines",
		pageTitle: "Create | Engines",
		content: ListLayout(
		{
			toolbar: EngineSettingsToolbar(options.settings),
			groupManager: options.groupManager,
			createHref: "/engines/create",
			content: Wrapper(
			[
				Breadcrumbs(
				[
					{
						href: "/engines",
						text: "Engines",
						pjaxSelector: "main",
					},
					{
						href: "/engines/create",
						text: "Create",
						pjaxSelector: "main",
					},
				]),

				Header(1, "Create engine"),

				UpsertEngineForm(null),
			]),
		}),
	};
}