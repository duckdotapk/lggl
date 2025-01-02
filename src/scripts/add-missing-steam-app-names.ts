//
// Imports
//

import "source-map-support/register.js";

import readline from "node:readline";

import { prismaClient } from "../instances/prismaClient.js";

import * as CliLib from "../libs/Cli.js";

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
		const steamAppName = await CliLib.prompt(readlineInterface, 
			{
				text: `Enter the Steam app name for "${game.name}"`,
				defaultValue: game.name,
				validateAndTransform: async (input) =>
				{
					return input;
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