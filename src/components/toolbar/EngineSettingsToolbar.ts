//
// Imports
//

import { Control } from "../input/Control.js";

import { Toolbar } from "./Toolbar.js";

import { getEngineGroupModeName, Settings } from "../../libs/models/Setting.js";
import { EngineGroupModeSchema } from "../../libs/models/Setting.schemas.js";

//
// Components
//

export function EngineSettingsToolbar(settings: Settings)
{
	return Toolbar("component-engine-settings-toolbar", null,
	[
		Control(
		{
			type: "select",
			name: "engineGroupMode",
			value: settings.engineGroupMode,
			required: true,
			showEmptyOption: false,
			options: EngineGroupModeSchema.options.map((engineGroupMode) => 
			({ 
				value: engineGroupMode, 
				label: "Group by " + getEngineGroupModeName(engineGroupMode),
			})),
		}),
	]);
}