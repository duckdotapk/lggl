//
// Imports
//

import { Prisma } from "@prisma/client";

import { GroupManager } from "../../classes/GroupManager.js";

import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { UpsertEngineForm } from "../../components/form/UpsertEngineForm.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { EngineSettingsToolbar } from "../../components/toolbar/EngineSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: GroupManager<Prisma.EngineGetPayload<null>>;
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