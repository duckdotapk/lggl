//
// Imports
//

import readline from "node:readline";

import chalk from "chalk";
import { z } from "zod";

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

export type PromptOptions<T> =
{
	options?: 
	{ 
		id: number;
		description: string;
	}[];
	validateAndTransform: (rawInput: string) => Promise<T>;
};

export async function prompt<T>(readlineInterface: readline.promises.Interface, question: string, promptOptions: PromptOptions<T>)
{
	let text = chalk.bold(question) + ":\n";

	if (promptOptions.options != null)
	{
		for (const option of promptOptions.options)
		{
			text += "  " + chalk.red(option.id + ":") + " " + option.description + "\n";
		}
	}

	const rawInput = await readlineInterface.question(text);

	try
	{
		return await promptOptions.validateAndTransform(rawInput);
	}
	catch (error)
	{
		if (error instanceof RetryableError)
		{
			console.error(error.message + "\n");

			return await prompt(readlineInterface, question, promptOptions);
		}
		else
		{
			readlineInterface.close();

			throw error;
		}
	}
}