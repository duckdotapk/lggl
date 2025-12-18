//
// Imports
//

import { Child, DE } from "@lorenstuff/document-builder";

//
// Component
//

export function Muted(children: Child)
{
	return new DE("span", "component-muted", children);
}