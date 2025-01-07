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
			text: "Enter the platform's name",
			validateAndTransform: async (input) => input,
		});

	const iconName = await CliLib.prompt(readlineInterface,
		{
			text: "Enter a FontAwesome icon name for the platform",
			defaultValue: "fa-solid fa-cube",
			validateAndTransform: async (input) => input,
		});

	return await prismaClient.platform.create(
		{
			data:
			{
				name,
				iconName,
			},
		});
}

export async function search(readlineInterface: readline.promises.Interface)
{
	return await CliLib.prompt(readlineInterface,
		{
			text: "Search for a platform",
			validateAndTransform: async (input) => await prismaClient.platform.findMany(
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

export async function choose(readlineInterface: readline.promises.Interface, platforms: Prisma.PlatformGetPayload<null>[])
{
	return await CliLib.prompt(readlineInterface, 
		{
			text: "Choose a platform",
			options: platforms.map((platform) => ({ value: platform.id.toString(), description: platform.name })),
			validateAndTransform: async (input) =>
			{
				const id = z.coerce.number().int().min(1).parse(input);

				const platform = platforms.find((platform) => platform.id == id);

				if (platform == null)
				{
					throw new CliLib.RetryableError("No platform found with that ID.");
				}

				return platform;
			},
		});
}