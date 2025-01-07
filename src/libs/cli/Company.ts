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
			text: "Enter the company's name",
			validateAndTransform: async (input) => input,
		});

	return await prismaClient.company.create(
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
			text: "Search for a company",
			validateAndTransform: async (input) => await prismaClient.company.findMany(
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

export async function choose(readlineInterface: readline.promises.Interface, companies: Prisma.CompanyGetPayload<null>[])
{
	return await CliLib.prompt(readlineInterface,
		{
			text: "Choose a company",
			options: companies.map((company) => ({ value: company.id.toString(), description: company.name })),
			validateAndTransform: async (input) =>
			{
				const id = z.coerce.number().int().min(1).parse(input);

				const company = companies.find((company) => company.id == id);

				if (company == null)
				{
					throw new CliLib.RetryableError("No company found with that ID.");
				}

				return company;
			},
		});
}