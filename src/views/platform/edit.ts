//
// Imports
//

import { Prisma } from "@prisma/client";

import { Breadcrumbs } from "../../components/basic/Breadcrumbs.js";
import { Header } from "../../components/basic/Header.js";

import { UpsertPlatformForm } from "../../components/form/UpsertPlatformForm.js";

import { ListLayout } from "../../components/layout/ListLayout.js";

import { PlatformSettingsToolbar } from "../../components/toolbar/PlatformSettingsToolbar.js";

import { SiteOptions } from "../../components/Site.js";
import { Wrapper } from "../../components/Wrapper.js";

import * as PlatformModelLib from "../../libs/models/Platform.js";
import * as SettingModelLib from "../../libs/models/Setting.js";

//
// View
//

type ViewOptions =
{
	settings: SettingModelLib.Settings;
	groupManager: Awaited<ReturnType<typeof PlatformModelLib.findGroups>>;
	platform: Prisma.PlatformGetPayload<null>;
};

export function view(options: ViewOptions): Partial<SiteOptions>
{
	const pageTitle = "Edit " + options.platform.name;

	return {
		currentPage: "platforms",
		pageTitle,
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
									href: "/platforms/view/" + options.platform.id,
									text: options.platform.name,
									pjaxSelector: "main",
								},
								{
									href: "/platforms/edit/" + options.platform.id,
									text: "Edit",
									pjaxSelector: "main",
								},
							]),
					
						Header(1, pageTitle),
		
						UpsertPlatformForm(options.platform),
					]),
			}),
	};
}