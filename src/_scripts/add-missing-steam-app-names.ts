//
// Imports
//

import readline from "node:readline";

import { prismaClient } from "../_shared/instances/prismaClient.js";

import * as CliLib from "../_shared/libs/Cli.js";

//
// Functions
//

async function main()
{
	const games = await prismaClient.game.findMany(
		{
			where:
			{
				steamAppId: { not: null },
				steamAppName: null,
			},
			orderBy:
			{
				name: "asc",
			},
		});

	if (games.length == 0)
	{
		console.log("All Steam games have steamAppName set already!");

		return;
	}

	const readlineInterface = readline.promises.createInterface(
		{
			input: process.stdin,
			output: process.stdout,
		});

	for (const game of games)
	{
		const steamAppName = await CliLib.prompt(readlineInterface, `Enter the Steam app name for '${game.name}' (use blank to use the game's library name)`,
			{
				validateAndTransform: async (input) =>
				{
					input = input.trim();

					return input.length > 0
						? input
						: game.name;
				},
			});

		await prismaClient.game.update(
			{
				where:
				{
					id: game.id,
				},
				data:
				{
					steamAppName,
				},
			});
	}

	readlineInterface.close();
}

//
// Script
//

await main();