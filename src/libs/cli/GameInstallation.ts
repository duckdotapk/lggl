//
// Imports
//

import fs from "node:fs";
import readline from "node:readline";

import { Prisma } from "@prisma/client";

import { prismaClient } from "../../instances/prismaClient.js";

import * as CliLib from "../Cli.js";
import * as FileSizeLib from "../FileSize.js";

//
// Utility Functions
//

export type CreateOptions =
{
	game: Prisma.GameGetPayload<null>;
};

export async function create(readlineInterface: readline.promises.Interface, options: CreateOptions)
{
	const gameInstallationPath = await CliLib.prompt(readlineInterface, 
		{
			text: "Enter the game's installation path",
			validateAndTransform: async (input) =>
			{
				if (!fs.existsSync(input))
				{
					throw new CliLib.RetryableError("Path does not exist. Please try again.");
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

				game_id: options.game.id,
			},
		});
}