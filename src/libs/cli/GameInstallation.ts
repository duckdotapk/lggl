//
// Imports
//

import fs from "node:fs";
import readline from "node:readline";

import { prismaClient } from "../../instances/prismaClient.js";

import * as GameCliLib from "./Game.js";

import * as CliLib from "../Cli.js";
import * as FileSizeLib from "../FileSize.js";

//
// Utility Functions
//

export async function create(readlineInterface: readline.promises.Interface)
{
	const games = await GameCliLib.search(readlineInterface);

	const game = await GameCliLib.choose(readlineInterface, games);

	const gameInstallationPath = await CliLib.prompt(readlineInterface, 
		{
			text: "Enter the game's installation path",
			validateAndTransform: async (input) =>
			{
				if (!fs.existsSync(input))
				{
					throw new CliLib.RetryableError("Path does not exist.");
				}

				return input;
			},
		});

	const gameInstallationPathSize = await FileSizeLib.getFolderSize(gameInstallationPath);
	
	const [ fileSizeGibiBytes, fileSizeBytes ] = FileSizeLib.toGibiBytesAndBytes(gameInstallationPathSize);

	return await prismaClient.gameInstallation.create(
		{
			data:
			{
				path: gameInstallationPath,
				fileSizeGibiBytes,
				fileSizeBytes,

				game_id: game.id,
			},
		});
}