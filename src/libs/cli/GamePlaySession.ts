//
// Imports
//

import readline from "node:readline";

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";
import { z } from "zod";

import { prismaClient } from "../../instances/prismaClient.js";

import * as CliLib from "../Cli.js";

//
// Utility Functions
//

export type CreateOptions =
{
	game: Prisma.GameGetPayload<null>;
	platform: Prisma.PlatformGetPayload<null>;
};

export async function create(readlineInterface: readline.promises.Interface, options: CreateOptions)
{
	const playTimeSeconds = await CliLib.prompt(readlineInterface, 
		{
			text: "Enter the playtime in HH:MM:SS format",
			validateAndTransform: async (input) =>
			{
				const inputComponents = input.split(":").map((component) => parseInt(component));

				const inputComponentsParseResult = z.tuple([ z.number().int(), z.number().int(), z.number().int() ]).safeParse(inputComponents);

				if (!inputComponentsParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid playtime format.");
				}

				const [ hours, minutes, seconds ] = inputComponentsParseResult.data;

				return (hours * 60 * 60) + (minutes * 60) + seconds;
			},
		});

	const notes = await CliLib.prompt(readlineInterface, 
		{
			text: "Enter any notes you want to add to this playtime (optional)",
			defaultValue: null,
			validateAndTransform: async (input) =>
			{
				return input.length > 0 ? input : null;
			},
		});

	return await prismaClient.$transaction(
		async (transactionClient) =>
		{
			await transactionClient.game.update(
				{
					where:
					{
						id: options.game.id,
					},
					data:
					{
						playTimeTotalSeconds: { increment: playTimeSeconds },
					},
				});

			return await transactionClient.gamePlaySession.create(
				{
					data:
					{
						startDate: DateTime.fromSeconds(0).toJSDate(),
						endDate: DateTime.fromSeconds(playTimeSeconds).toJSDate(),
						playTimeSeconds,
						addedToTotal: true,
						isHistorical: true,
						notes,
		
						game_id: options.game.id,
						platform_id: options.platform.id,
					},
				});
		});
}