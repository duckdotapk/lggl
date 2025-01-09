//
// Imports
//

import { ButtonElementAttributes, DE } from "@donutteam/document-builder";

//
// Component
//

export type ButtonOptions =
{
	type?: "button" | "submit";
	iconName?: string;
	text?: string;

	extraAttributes?: ButtonElementAttributes;
};

export function Button(options: ButtonOptions)
{
	const type = options.type ?? "button";

	return new DE("button",
		{
			class: "component-button",

			type,
			
			...options.extraAttributes,
		},
		[
			options.iconName != null ? new DE("span", "icon " + options.iconName) : null,

			options.text != null ? new DE("span", "text", options.text) : null,
		]);
}