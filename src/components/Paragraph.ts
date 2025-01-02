//
// Imports
//

import { Child, DE } from "@donutteam/document-builder";

//
// Component
//

export function Paragraph(text: Child)
{
	return new DE("p", "component-paragraph", text);
}