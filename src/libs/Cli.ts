//
// Imports
//

import readline from "node:readline";

import chalk from "chalk";
import { z, ZodError } from "zod";

//
// Classes
//

export class RetryableError extends Error
{
	constructor(zodIssuesOrMessage: z.ZodIssue[] | string)
	{
		if (Array.isArray(zodIssuesOrMessage))
		{
			const message = zodIssuesOrMessage.map((issue) => issue.message).join("\n");

			super(message);
		}
		else
		{
			super(zodIssuesOrMessage);
		}
	}
}

//
// Utility Functions
//

export type ConfirmOptions =
{
	text: string;
	defaultValue?: boolean;
};

export async function confirm(readlineInterface: readline.promises.Interface, options: ConfirmOptions)
{
	let text = chalk.bold(options.text + " (" + chalk.green("yes") + "/" + chalk.green("no") + "):\n");

	if (options.defaultValue !== undefined)
	{
		text += " (default: " + (options.defaultValue ? "yes" : "no") + ")\n";
	}

	const rawInput = await readlineInterface.question(text);

	try
	{
		let input = rawInput.trim().toLowerCase();

		if (input == "" && options.defaultValue !== undefined)
		{
			return options.defaultValue;
		}

		switch (input)
		{
			case "yes":
			case "y":
				return true;

			case "no":
			case "n":
				return false;
			
			default:
				throw new RetryableError("Invalid input, please enter \"yes\" or \"no\"!");
		}
	}
	catch (error)
	{
		if (error instanceof RetryableError)
		{
			console.error(error.message + "\n");

			return await confirm(readlineInterface, options);
		}

		throw error;
	}
}

export async function pause(readlineInterface: readline.promises.Interface, text?: string)
{
	await readlineInterface.question(text ?? "Press enter to continue");
}

export type PromptOptions<T> =
{
	text: string;
	defaultValue?: T;
	options?: 
	{ 
		value: string;
		description?: string;
	}[];
	validateAndTransform: (rawInput: string) => Promise<T>;
};

export async function prompt<T>(readlineInterface: readline.promises.Interface, options: PromptOptions<T>)
{
	let text = chalk.bold(options.text)

	if (options.defaultValue !== undefined)
	{
		text += options.defaultValue === null
			? " (optional)"
			: " (default: \"" + options.defaultValue + "\")";
	}

	text += ":\n";

	if (options.options != null)
	{
		for (const option of options.options)
		{
			text += "  " + chalk.green(option.value);

			if (option.description != null)
			{
				text += ": " + option.description;
			}

			text += "\n";
		}
	}

	const rawInput = await readlineInterface.question(text);

	try
	{
		let input = rawInput.trim();
	
		if (input == "")
		{
			if (options.defaultValue !== undefined)
			{
				return options.defaultValue;
			}

			throw new RetryableError("No default value, please enter a value!");
		}

		return await options.validateAndTransform(rawInput);
	}
	catch (error)
	{
		if (error instanceof RetryableError)
		{
			console.error(error.message + "\n");

			return await prompt(readlineInterface, options);
		}
		else if (error instanceof ZodError)
		{
			for (const issue of error.issues)
			{
				console.error(issue.message);
			}

			return await prompt(readlineInterface, options);
		}

		throw error;
	}
}