//
// Imports
//

import { Prisma } from "@prisma/client";

import { GroupManager } from "../../classes/GroupManager.js";

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

type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: GroupManager<Prisma.EngineGetPayload<null>>;
	engine: Prisma.EngineGetPayload<null>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const engineName = options.engine.shortName ?? options.engine.name;

	return {
		currentPage: "engines",
		pageTitle: "Edit " + engineName + " | Engines",
		content: ListLayout(
			{
				toolbar: EngineSettingsToolbar(options.settings),
				groupManager: options.groupManager,
				createHref: "/engines/create",
				content: Wrapper("45rem",
					[		
						Header(1, engineName),
		
						UpsertEngineForm(options.engine),
					]),
			}),
	};
}