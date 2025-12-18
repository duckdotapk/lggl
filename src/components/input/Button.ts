//
// Imports
//

import { ButtonElementAttributes, DE } from "@lorenstuff/document-builder";

//
// Component
//

export type ButtonOptions =
{
	style: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "link";
	extraAttributes?: ButtonElementAttributes;
	iconName?: string;
	text?: string;
} &
(
	{
		href: string;
	} |
	{
		type: "button" | "submit";
	}
);

export function Button(options: ButtonOptions)
{
	const tagName = "href" in options ? "a" : "button";

	const href = "href" in options ? options.href : null;
	const type = "type" in options ? options.type : null;

	return new DE(tagName,
		{
			class: "component-button " + options.style,

			href,
			type,
			
			...options.extraAttributes,
		},
		[
			options.iconName != null
				? new DE("span", "icon " + options.iconName)
				: null,

			options.text != null
				? new DE("span", "text", options.text)
				: null,
		],
	);
}