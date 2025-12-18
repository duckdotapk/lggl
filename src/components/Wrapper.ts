//
// Imports
//

import { Child, DE } from "@lorenstuff/document-builder";

//
// Component
//

export function Wrapper(children: Child)
{
	return new DE("div", "component-wrapper", new DE("div", "content", children));
}