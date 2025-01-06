//
// Imports
//

import readline from "node:readline";

import { z } from "zod";

import { prismaClient } from "../../instances/prismaClient.js";

import * as GameCliLib from "./Game.js";
import * as SeriesCliLib from "./Series.js";

import * as CliLib from "../Cli.js";

//
// Utility Functions
//

export async function create(readlineInterface: readline.promises.Interface)
{
	const games = await GameCliLib.search(readlineInterface);

	const game = await GameCliLib.choose(readlineInterface, games);

	const seriesList = await SeriesCliLib.search(readlineInterface);

	const series = await SeriesCliLib.choose(readlineInterface, seriesList);

	const seriesGameNumber = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the game's number in the series",
			validateAndTransform: async (input) =>
			{
				const inputParseResult = z.number().int().min(1).safeParse(parseInt(input));

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid series game number.");
				}

				return inputParseResult.data;
			},
		});

	return await prismaClient.seriesGame.create(
		{
			data:
			{
				number: seriesGameNumber,

				game_id: game.id,
				series_id: series.id,
			},
		});
}