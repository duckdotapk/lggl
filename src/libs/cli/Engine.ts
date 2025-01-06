//
// Imports
//

import readline from "node:readline";

import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prismaClient } from "../../instances/prismaClient.js";

import * as CliLib from "../Cli.js";

//
// Utility Functions
//

export async function create(readlineInterface: readline.promises.Interface)
{
	const name = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the engine's name",
			validateAndTransform: async (input) => input,
		});

	return await prismaClient.engine.create(
		{
			data:
			{
				name,
			},
		});
}

export async function search(readlineInterface: readline.promises.Interface)
{
	return await CliLib.prompt(readlineInterface,
		{
			text: "Search for an engine",
			validateAndTransform: async (input) =>
			{
				const engines = await prismaClient.engine.findMany(
					{
						where:
						{
							name: { contains: input },
						},
						orderBy:
						{
							name: "asc",
						},
					});

				if (engines.length == 0)
				{
					throw new CliLib.RetryableError("No engines found.");
				}

				return engines;
			},
		});
}

export async function choose(readlineInterface: readline.promises.Interface, engines: Prisma.EngineGetPayload<null>[])
{
	return await CliLib.prompt(readlineInterface,
		{
			text: "Choose an engine",
			options: engines.map(
				(engine) =>
				{
					return {
						value: engine.id.toString(),
						description: engine.name,
					};
				}),
			validateAndTransform: async (input) =>
			{
				const inputParseResult = z.number().int().min(1).safeParse(parseInt(input));

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid engine ID.");
				}

				const id = inputParseResult.data;

				const engine = engines.find((engine) => engine.id == id);

				if (engine == null)
				{
					throw new CliLib.RetryableError("No engine found with that ID.");
				}

				return engine;
			},
		});
}