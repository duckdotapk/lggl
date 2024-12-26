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
	prompt: string;
	validateAndTransform: (rawInput: string) => Promise<T>;
};

export async function prompt<T>(promptOptions: PromptOptions<T>)
{
	const readlineInterface = readline.promises.createInterface(
		{
			input: process.stdin,
			output: process.stdout,
		});

	while (true)
	{
		const rawInput = await readlineInterface.question(chalk.bold(promptOptions.prompt) + ": ");

		try
		{
			const input = await promptOptions.validateAndTransform(rawInput);

			readlineInterface.close();

			return input;
		}
		catch (error)
		{
			if (error instanceof RetryableError)
			{
				console.error(error.message);
			}
			else
			{
				readlineInterface.close();

				throw error;
			}
		}
	}
}