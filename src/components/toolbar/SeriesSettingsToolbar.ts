//
// Imports
//

import { Control } from "../input/Control.js";

import { Toolbar } from "./Toolbar.js";

import { getSeriesGroupModeName, Settings } from "../../libs/models/Setting.js";
import { SeriesGroupModeSchema } from "../../libs/models/Setting.schemas.js";

//
// Components
//

export function SeriesSettingsToolbar(settings: Settings)
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
			options: SeriesGroupModeSchema.options.map((option) =>
			({
				value: option,
				label: "Group by " + getSeriesGroupModeName(option),
			})),
		}),
	]);
}