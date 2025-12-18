//
// Imports
//

import { Control } from "../input/Control.js";

import { Toolbar } from "./Toolbar.js";

import { getCompanyGroupModeName, Settings } from "../../libs/models/Setting.js";
import { CompanyGroupModeSchema } from "../../libs/models/Setting.schemas.js";

//
// Components
//

export function CompanySettingsToolbar(settings: Settings)
{
	return Toolbar("component-company-settings-toolbar", null,
	[
		Control(
		{
			type: "select",
			name: "companyGroupMode",
			value: settings.companyGroupMode,
			required: true,
			showEmptyOption: false,
			options: CompanyGroupModeSchema.options.map((companyGroupMode) => 
			({ 
				value: companyGroupMode, 
				label: "Group by " + getCompanyGroupModeName(companyGroupMode),
			})),
		}),
	]);
}