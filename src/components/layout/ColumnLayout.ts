//
// Imports
//

import { Child, DE } from "@lorenstuff/document-builder";

//
// Component
//

export function ColumnLayout(numberOfColumns: number, children: Child[])
{
	return new DE("div",
		{
			class: "component-column-layout",
			style: "--component-column-layout-number-of-columns: " + numberOfColumns + ";",
		},
		children,
	);
}