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

export function SeriesSettingsToolbar(settings: SettingModelLib.Settings)
{
	return Toolbar("component-series-settings-toolbar", null,
		[
			Control(
				{
					type: "select",
					name: "seriesGroupMode",
					value: settings.seriesGroupMode,
					required: true,
					showEmptyOption: false,
					options: SettingSchemaLib.SeriesGroupModeSchema.options.map(
						(option) =>
						({
							value: option,
							label: "Group by " + SettingModelLib.getSeriesGroupModeName(option),
						})),
				}),
		]);
}