//
// Imports
//

import { Child, DE } from "@donutteam/document-builder";

//
// Component
//

export function Header(level: 1 | 2 | 3 | 4 | 5 | 6, text: Child)
{
	return new DE("h" + level, "component-header", text);
}