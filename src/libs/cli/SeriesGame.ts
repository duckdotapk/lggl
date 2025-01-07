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

export type CreateOptions =
{
	series: Prisma.SeriesGetPayload<null>;
	game: Prisma.GameGetPayload<null>;
};

export async function create(readlineInterface: readline.promises.Interface, options: CreateOptions)
{
	const seriesGameNumber = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the game's number in the series",
			validateAndTransform: async (input) => z.coerce.number().int().min(1).parse(input),
		});

	return await prismaClient.seriesGame.create(
		{
			data:
			{
				number: seriesGameNumber,

				game_id: options.game.id,
				series_id: options.series.id,
			},
		});
}