//
// Imports
//

import { Child, DE, ElementAttributes } from "@lorenstuff/document-builder";

//
// Component
//

export function Dialog
(
	className: string,
	extraAttributes: ElementAttributes | null,
	children: Child,
)
{
	return new DE("dialog", 
		{
			class: "component-dialog " + className,
			...extraAttributes,
		}, 
		children,
	);
}