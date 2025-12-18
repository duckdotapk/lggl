//
// Imports
//

import { Control } from "../input/Control.js";

import { Toolbar } from "./Toolbar.js";

import { getPlatformGroupModeName, Settings } from "../../libs/models/Setting.js";
import { PlatformGroupModeSchema } from "../../libs/models/Setting.schemas.js";

//
// Components
//

export function PlatformSettingsToolbar(settings: Settings)
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
			options: PlatformGroupModeSchema.options.map((platformGroupMode) => 
			({ 
				value: platformGroupMode, 
				label: "Group by " + getPlatformGroupModeName(platformGroupMode),
			})),
		}),
	]);
}