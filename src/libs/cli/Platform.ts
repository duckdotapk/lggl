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
			validateAndTransform: async (input) =>
			{
				const platforms = await prismaClient.platform.findMany(
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

				if (platforms.length == 0)
				{
					throw new CliLib.RetryableError("No platforms found.");
				}

				return platforms;
			},
		});
}

export async function choose(readlineInterface: readline.promises.Interface, platforms: Prisma.PlatformGetPayload<null>[])
{
	return await CliLib.prompt(readlineInterface, 
		{
			text: "Choose a platform",
			options: platforms.map(
				(platform) =>
				{
					return {
						value: platform.id.toString(),
						description: platform.name,
					};
				}),
			validateAndTransform: async (input) =>
			{
				const inputParseResult = z.number().int().min(1).safeParse(parseInt(input));

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid platform ID.");
				}

				const id = inputParseResult.data;

				const platform = platforms.find((platform) => platform.id == id);

				if (platform == null)
				{
					throw new CliLib.RetryableError("No platform found with that ID.");
				}

				return platform;
			},
		});
}