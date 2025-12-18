//
// Imports
//

import { Child, DE } from "@lorenstuff/document-builder";

//
// Component
//

export function Anchor(text: Child, href: string, target: "_self" | "_blank" = "_self")
{
	return new DE("a",
		{
			class: "component-anchor",
			href,
			target,
		},
		text,
	);
}