//
// Imports
//

import { Child, DE } from "@donutteam/document-builder";

//
// Component
//

export function AutomaticGridColumns(minimumColumnWidth: string, children: Child[])
{
	return new DE("div",
		{
			class: "component-automatic-grid-columns",
			style: "--component-automatic-grid-columns-minimum-column-width: " + minimumColumnWidth + ";",
		},
		children);
}