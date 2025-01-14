//
// Imports
//

import { Prisma } from "@prisma/client";

import { GroupManager } from "../../classes/GroupManager.js";

import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { UpsertPlatformForm } from "../../components/form/UpsertPlatformForm.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { PlatformSettingsToolbar } from "../../components/toolbar/PlatformSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

export type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: GroupManager<Prisma.PlatformGetPayload<null>>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	return {
		currentPage: "platforms",
		pageTitle: "Create platform",
		content: ListLayout(
			{
				toolbar: PlatformSettingsToolbar(options.settings),
				groupManager: options.groupManager,
				createHref: "/platforms/create",
				content: Wrapper(
					[
						Breadcrumbs(
							[
								{
									href: "/platforms",
									text: "Platforms",
									pjaxSelector: "main",
								},
								{
									href: "/platforms/create",
									text: "Create",
									pjaxSelector: "main",
								},
							]),

						Header(1, "Create platform"),
		
						UpsertPlatformForm(null),
					]),
			}),
	};
}