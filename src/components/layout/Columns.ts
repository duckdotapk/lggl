//
// Imports
//

import { Child, DE } from "@donutteam/document-builder";

//
// Component
//

export function Columns(numberOfColumns: number, children: Child[])
{
	return new DE("div",
		{
			class: "component-columns",
			style: "--component-columns-number-of-columns: " + numberOfColumns + ";",
		},
		children);
}