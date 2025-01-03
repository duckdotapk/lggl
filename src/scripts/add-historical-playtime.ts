//
// Imports
//

import "source-map-support/register.js";

import readline from "node:readline";

import { DateTime } from "luxon";
import { z } from "zod";

import { prismaClient } from "../instances/prismaClient.js";

import * as CliLib from "../libs/Cli.js";

//
// Functions
//

async function main()
{
	const readlineInterface = readline.promises.createInterface(
		{
			input: process.stdin,
			output: process.stdout,
		});

	const games = await CliLib.prompt(readlineInterface,
		{
			text: "Search for a game by name",
			validateAndTransform: async (input) =>
			{
				const games = await prismaClient.game.findMany(
					{
						where:
						{
							name: { contains: input },
						},
						include:
						{
							gamePlayActions: true,
						},
						orderBy:
						{
							id: "asc",
						},
					});

				if (games.length == 0)
				{
					throw new CliLib.RetryableError("No games found.");
				}

				return games;
			},
		});

	const game = await CliLib.prompt(readlineInterface, 
		{
			text: "Choose which game you want to add a playtime to",
			options: games.map(
				(game) =>
				{
					return {
						value: game.id.toString(),
						description: game.name,
					};
				}),
			validateAndTransform: async (input) =>
			{
				const inputParseResult = z.number().int().min(1).safeParse(parseInt(input.trim()));

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid game ID.");
				}

				const id = inputParseResult.data;

				const game = games.find((game) => game.id == id);

				if (game == null)
				{
					throw new CliLib.RetryableError("No game found with that ID.");
				}

				return game;
			},
		});

	if (game == null)
	{
		throw new Error("Game not found.");
	}

	const gamePlayAction = await CliLib.prompt(readlineInterface, 
		{
			text: "Choose which game play action you want to associate this playtime with",
			options: game.gamePlayActions.map(
				(gamePlayAction) =>
				{
					return {
						value: gamePlayAction.id.toString(),
						description: gamePlayAction.name,
					};
				}),
			validateAndTransform: async (input) =>
			{
				const inputParseResult = z.number().int().min(1).safeParse(parseInt(input.trim()));

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid game play action ID.");
				}

				const id = inputParseResult.data;

				const gamePlayAction = game.gamePlayActions.find((gamePlayAction) => gamePlayAction.id == id);

				if (gamePlayAction == null)
				{
					throw new CliLib.RetryableError("No game play action found with that ID.");
				}

				return gamePlayAction;
			},
		});

	const platforms = await prismaClient.platform.findMany(
		{
			orderBy:
			{
				id: "asc",
			},
		});

	const platform = await CliLib.prompt(readlineInterface, 
		{
			text: "Enter the ID of the platform this playtime is from",
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
				const inputParseResult = z.number().int().min(1).safeParse(parseInt(input.trim()));

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
			text: "Enter any notes you want to add to this playtime",
			validateAndTransform: async (input) =>
			{
				input = input.trim();

				return input.length > 0 ? input : null;
			},
		});

	readlineInterface.close();

	const gamePlayActionSession = await prismaClient.$transaction(
		async (transactionClient) =>
		{
			await transactionClient.game.update(
				{
					where:
					{
						id: game.id,
					},
					data:
					{
						playTimeTotalSeconds: { increment: playTimeSeconds },
					},
				});

			return await transactionClient.gamePlayActionSession.create(
				{
					data:
					{
						startDate: DateTime.fromSeconds(0).toJSDate(),
						endDate: DateTime.fromSeconds(playTimeSeconds).toJSDate(),
						playTimeSeconds,
						addedToTotal: true,
						isHistorical: true,
						notes,
		
						gamePlayAction_id: gamePlayAction.id,
						platform_id: platform.id,
					},
				});
		});

	console.log("Created historical game play action session with ID: %d", gamePlayActionSession.id);
}

//
// Script
//

await main();