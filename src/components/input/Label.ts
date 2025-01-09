//
// Imports
//

import { Child, DE } from "@donutteam/document-builder";

//
// Component
//

export function Label(inputName: string | null, text: Child)
{
	return new DE("label", 
		{ 
			class: "component-label", 
			for: inputName,
		},
		text);
}