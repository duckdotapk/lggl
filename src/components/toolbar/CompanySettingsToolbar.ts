//
// Imports
//

import { Control } from "../input/Control.js";

import { Toolbar } from "./Toolbar.js";

import * as SettingModelLib from "../../libs/models/Setting.js";

import * as SettingSchemaLib from "../../libs/schemas/Setting.js";

//
// Components
//

export function CompanySettingsToolbar(settings: SettingModelLib.Settings)
{
	return Toolbar("component-company-settings-toolbar", null,
		[
			Control(
				{
					type: "select",
					name: "companyGroupMode",
					value: settings.companyGroupMode,
					required: true,
					options:
					[
						{ value: "name" satisfies SettingSchemaLib.CompanyGroupMode, label: "Group by Name" },
					],
				}),
		]);
}