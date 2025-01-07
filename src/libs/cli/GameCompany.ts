//
// Imports
//

import readline from "node:readline";

import { Prisma } from "@prisma/client";

import { prismaClient } from "../../instances/prismaClient.js";

import * as GameCompanySchemaLib from "../schemas/GameCompany.js";

import * as CliLib from "../Cli.js";

//
// Utility Functions
//

export type CreateOptions =
{
	game: Prisma.GameGetPayload<null>;
	company: Prisma.CompanyGetPayload<null>;
};

export async function create(readlineInterface: readline.promises.Interface, options: CreateOptions)
{
	const type = await CliLib.prompt(readlineInterface,
		{
			text: "Choose company type",
			options: GameCompanySchemaLib.TypeSchema.options.map((type) => ({ value: type })),
			validateAndTransform: async (input) => GameCompanySchemaLib.TypeSchema.parse(input.toUpperCase()),
		});

	const notes = await CliLib.prompt(readlineInterface,
		{
			text: "Enter notes for this company",
			defaultValue: null,
			validateAndTransform: async (input) => input,
		});

	return await prismaClient.gameCompany.create(
		{
			data:
			{
				notes,
				type,

				company_id: options.company.id,
				game_id: options.game.id,
			},
		});
}