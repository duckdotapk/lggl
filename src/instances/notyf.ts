//
// Imports
//

import * as Notyf from "notyf";

//
// Instance
//

export const notyf = new Notyf.Notyf(
{
	duration: 5000,
	ripple: false,
	types:
	[
		{
			type: "error",
			className: "notyf-notification",
			icon:
			{
				className: "fa-solid fa-exclamation-triangle",
				tagName: "span",
				color: "#ffffff",
			},
		},
	],
});