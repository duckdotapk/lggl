//
// Imports
//

import { Child, DE } from "@donutteam/document-builder";

//
// Component
//

export function AutomaticColumns(minimumColumnWidth: string, children: Child[])
{
	return new DE("div",
		{
			class: "component-automatic-columns",
			style: "--component-automatic-columns-minimum-column-width: " + minimumColumnWidth + ";",
		},
		children);
}