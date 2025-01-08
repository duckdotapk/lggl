//
// Imports
//

import { ButtonElementAttributes, DE } from "@donutteam/document-builder";

//
// Component
//

export type ButtonOptions =
{
	iconName?: string;
	text?: string;

	extraAttributes?: ButtonElementAttributes;
};

export function Button(options: ButtonOptions)
{
	return new DE("button",
		{
			class: "component-button",

			...options.extraAttributes,
		},
		[
			options.iconName != null ? new DE("span", "icon " + options.iconName) : null,

			options.text != null ? new DE("span", "text", options.text) : null,
		]);
}