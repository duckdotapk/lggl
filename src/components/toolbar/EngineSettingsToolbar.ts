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

export function EngineSettingsToolbar(settings: SettingModelLib.Settings)
{
	return Toolbar("component-engine-settings-toolbar", null,
		[
			Control(
				{
					type: "select",
					name: "engineGroupMode",
					value: settings.engineGroupMode,
					required: true,
					options:
					[
						{ value: "name" satisfies SettingSchemaLib.EngineGroupMode, label: "Group by Name" },
					],
				}),
		]);
}