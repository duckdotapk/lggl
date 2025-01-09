//
// Imports
//

import { Child, DE } from "@donutteam/document-builder";

//
// Component
//

export function Wrapper(contentWidth: string, children: Child)
{
	return new DE("div",
		{
			class:  "component-wrapper",
			style: "--component-wrapper-content-width: " + contentWidth + ";",
		}, 
		new DE("div", "content", children));
}