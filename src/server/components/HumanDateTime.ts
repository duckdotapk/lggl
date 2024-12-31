//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { DateTime, DateTimeFormatOptions } from "luxon";

//
// Component
//

const oneWeekSeconds = 60 * 60 * 24 * 7;

export function HumanDateTime(dateTime: DateTime, format: DateTimeFormatOptions = DateTime.DATETIME_MED)
{
	let text = dateTime.toSeconds() > (DateTime.now().toSeconds() - oneWeekSeconds)
		? dateTime.toRelative()
		: dateTime.toLocaleString(format);

		return new DE("time",
			{
				datetime: dateTime.toISO(
					{
						includeOffset: true,
					}),
			},
			text);
}