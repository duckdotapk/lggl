//
// Imports
//

import { ButtonElementAttributes, DE } from "@donutteam/document-builder";

//
// Component
//

export function Button(text: string, extraAttributes?: ButtonElementAttributes)
{
	return new DE("button",
		{
			class: "component-button",

			...extraAttributes,
		},
		text);
}