//
// Imports
//

import { Child, DE } from "@lorenstuff/document-builder";

//
// Component
//

export function AutomaticColumnLayout(minimumColumnWidth: string, children: Child[])
{
	return new DE("div",
		{
			class: "component-automatic-column-layout",
			style: "--component-automatic-column-layout-minimum-column-width: " + minimumColumnWidth + ";",
		},
		children,
	);
}