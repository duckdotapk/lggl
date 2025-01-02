//
// Imports
//

import fs from "node:fs";
import readline from "node:readline";

import { z } from "zod";

import { prismaClient } from "../_shared/instances/prismaClient.js";

import * as CliLib from "../_shared/libs/Cli.js";
import * as FileSizeLib from "../_shared/libs/FileSize.js";

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

	const games = await CliLib.prompt(readlineInterface, "Search for a game by name",
		{
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

	const game = await CliLib.prompt(readlineInterface, "Choose which game you want to add a playtime to",
		{
			options: games.map(
				(game) =>
				{
					return {
						id: game.id,
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

	const installationPath = await CliLib.prompt(readlineInterface, "Enter the game's installation path",
		{
			validateAndTransform: async (input) =>
			{
				input = input.trim();

				if (!fs.existsSync(input))
				{
					throw new CliLib.RetryableError("Path does not exist.");
				}

				return input;
			},
		});

	readlineInterface.close();

	const installationPathSize = await FileSizeLib.getFolderSize(installationPath);

	const [ gibiBytes, bytes ] = FileSizeLib.toGibiBytesAndBytes(installationPathSize);

	const gameInstallation = await prismaClient.gameInstallation.create(
		{
			data:
			{
				fileSizeGibiBytes: gibiBytes,
				fileSizeBytes: bytes,
				path: installationPath,

				game_id: game.id,
			},
		});

	console.log("Created game installation with ID: %d", gameInstallation.id);
}

//
// Script
//

await main();