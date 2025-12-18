//
// Imports
//

import { Child, DE, ElementAttributes } from "@lorenstuff/document-builder";

//
// Components
//

export type ToolbarOptions =
{
	className: string;
	extraAttributes?: ElementAttributes;
};

export function Toolbar
(
	className: string,
	extraAttributes: ElementAttributes | null,
	children: Child,
)
{
	return new DE("form",
		{
			class: "component-toolbar " + className,
			autocomplete: "off",
			...extraAttributes,
		},
		children,
	);
}