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
			validateAndTransform: async (input) => await prismaClient.engine.findMany(
				{
					where:
					{
						name: { contains: input },
					},
					orderBy:
					{
						name: "asc",
					},
				}),
		});
}

export async function choose(readlineInterface: readline.promises.Interface, engines: Prisma.EngineGetPayload<null>[])
{
	return await CliLib.prompt(readlineInterface,
		{
			text: "Choose an engine",
			options: engines.map((engine) => ({ value: engine.id.toString(), description: engine.name })),
			validateAndTransform: async (input) =>
			{
				const id = z.coerce.number().int().min(1).parse(input);

				const engine = engines.find((engine) => engine.id == id);

				if (engine == null)
				{
					throw new CliLib.RetryableError("No engine found with that ID.");
				}

				return engine;
			},
		});
}