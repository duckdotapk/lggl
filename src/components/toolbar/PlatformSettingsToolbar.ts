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

export function PlatformSettingsToolbar(settings: SettingModelLib.Settings)
{
	return Toolbar("component-platform-settings-toolbar", null,
		[
			Control(
				{
					type: "select",
					name: "platformGroupMode",
					value: settings.platformGroupMode,
					required: true,
					showEmptyOption: false,
					options:
					[
						{ value: "name" satisfies SettingSchemaLib.PlatformGroupMode, label: "Group by Name" },
					],
				}),
		]);
}