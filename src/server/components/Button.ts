//
// Imports
//

import { DE } from "@donutteam/document-builder";

//
// Component
//

export function Button(text: string)
{
	return new DE("button", "component-button", text);
}