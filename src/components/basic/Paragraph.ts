//
// Imports
//

import { Child, DE } from "@lorenstuff/document-builder";

//
// Component
//

export function Paragraph(text: Child)
{
	return new DE("p", "component-paragraph", text);
}