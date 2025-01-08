//
// Imports
//

import { Child, DE } from "@donutteam/document-builder";

//
// Component
//

export function Muted(children: Child)
{
	return new DE("span", "component-muted", children);
}