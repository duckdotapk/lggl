//
// Imports
//

import humanizeDuration from "humanize-duration";

//
// Instance
//

export const shortEnglishHumanizer = humanizeDuration.humanizer(
	{
		language: "shortEn",
		languages: 
		{
			shortEn:
			{
				y: () => "y",
				mo: () => "mo",
				w: () => "w",
				d: () => "d",
				h: () => "h",
				m: () => "m",
				s: () => "s",
				ms: () => "ms",
			},
		},

		units: [ "h", "m", "s" ],

		delimiter: " ",
		spacer: "",
		conjunction: "",
	});

// TODO: less stupid name for this
export const shortEnglishHumanizer2 = humanizeDuration.humanizer(
	{
		language: "shortEn",
		languages: 
		{
			shortEn:
			{
				y: () => "y",
				mo: () => "mo",
				w: () => "w",
				d: () => "d",
				h: () => "h",
				m: () => "m",
				s: () => "s",
				ms: () => "ms",
			},
		},

		units: [ "d", "h", "m", "s" ],

		delimiter: " ",
		spacer: "",
		conjunction: "",
	});