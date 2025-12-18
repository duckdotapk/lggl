//
// Imports
//

import { Child, DE } from "@lorenstuff/document-builder";

//
// Component
//

export function Checkbox(name: string, label: Child, checked: boolean)
{
	return new DE("label", "component-checkbox",
	[
		new DE("input",
		{
			type: "checkbox",
			name: name,
			checked,
		}),
		
		new DE("span", "label", label),
	]);
}