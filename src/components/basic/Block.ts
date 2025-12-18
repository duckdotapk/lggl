//
// Imports
//

import { Child, DE } from "@lorenstuff/document-builder";

//
// Component
//

export function Block(children: Child)
{
	return new DE("div", "component-block", children);
}