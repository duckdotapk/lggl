//
// Imports
//

import { DE } from "@donutteam/document-builder";
import { DateTime } from "luxon";

//
// Component
//

export type ControlOptions =
{
	name: string;
	required: boolean;
} &
(
	{
		type: "date";
		value?: DateTime | null;
	} |
	{
		type: "datetime";
		value?: DateTime | null;
	} |
	{
		type: "number";
		value?: number | null;
	} |
	{
		type: "select",
		value?: string | number | null;
		options: { value: string | number, label: string }[];
	} |
	{
		type: "text";
		value?: string | null;
		placeholder: string;
	} |
	{
		type: "textarea",
		value?: string | null;
		placeholder: string;
	}
);

export function Control(options: ControlOptions)
{
	switch (options.type)
	{
		case "date":
		{
			return new DE("input",
				{
					class: "component-control",
					type: "date",
					name: options.name,
					required: options.required,
					value: options.value?.toFormat("yyyy-MM-dd"),
				});
		}

		case "datetime":
		{
			return new DE("input",
				{
					class: "component-control",
					type: "datetime-local",
					name: options.name,
					required: options.required,
					value: options.value?.toFormat("yyyy-MM-dd'T'HH:mm"),
				});
		}

		case "number":
		{
			return new DE("input",
				{
					class: "component-control",
					type: "number",
					name: options.name,
					required: options.required,
					value: options.value,
				});
		}

		case "select":
		{
			return new DE("select",
				{
					class: "component-control",
					name: options.name,
					required: options.required,
				},
				[
					new DE("option",
						{
							value: "",
							selected: options.value == null,
						},
						"- Choose an option -"),

					...options.options.map(option => new DE("option",
						{
							value: option.value,
							selected: options.value === option.value,
						},
						option.label))
				]);
		}

		case "text":
		{
			return new DE("input",
				{
					class: "component-control",
					type: "text",
					name: options.name,
					required: options.required,
					value: options.value,
					placeholder: options.placeholder,
				});
		}

		case "textarea":
		{
			return new DE("textarea",
				{
					class: "component-control",
					name: options.name,
					required: options.required,
					placeholder: options.placeholder,
				},
				options.value);
		}
	}
}