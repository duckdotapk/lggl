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
			text: "Enter the series' name",
			validateAndTransform: async (input) => input,
		});

	return await prismaClient.series.create(
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
			text: "Search for a series",
			validateAndTransform: async (input) => await prismaClient.series.findMany(
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

export async function choose(readlineInterface: readline.promises.Interface, seriesList: Prisma.SeriesGetPayload<null>[])
{
	return await CliLib.prompt(readlineInterface,
		{
			text: "Choose a series",
			options: seriesList.map((series) => ({ value: series.id.toString(), description: series.name })),
			validateAndTransform: async (input) =>
			{
				const id = z.coerce.number().int().min(1).parse(input);

				const series = seriesList.find((series) => series.id == id);

				if (series == null)
				{
					throw new CliLib.RetryableError("No series found with that ID.");
				}

				return series;
			},
		});
}

export async function searchAndChooseOne(readlineInterface: readline.promises.Interface)
{
	while (true)
	{
		const seriesList = await search(readlineInterface);

		if (seriesList.length == 0)
		{
			console.log("No series found. Please try again.");

			continue;
		}

		return await choose(readlineInterface, seriesList);
	}
}