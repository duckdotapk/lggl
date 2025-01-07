//
// Imports
//

import fs from "node:fs";
import readline from "node:readline";

import { Prisma } from "@prisma/client";

import { prismaClient } from "../../instances/prismaClient.js";

import * as GamePlayActionSchemaLib from "../schemas/GamePlayAction.js";

import * as CliLib from "../Cli.js";

//
// Utility Functions
//

export type CreateOptions =
{
	game: Prisma.GameGetPayload<null>;
};

export async function create(readlineInterface: readline.promises.Interface, options: CreateOptions)
{
	const name = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the name of the game play action",
			defaultValue: "Play",
			validateAndTransform: async (input) => input,
		});

	const type = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the type of the game play action",
			defaultValue: "URL",
			options: GamePlayActionSchemaLib.TypeSchema.options.map((type) => ({ value: type })),
			validateAndTransform: async (input) => GamePlayActionSchemaLib.TypeSchema.parse(input.toUpperCase()),
		});

	const path = type == "EXECUTABLE"
		? await CliLib.prompt(readlineInterface,
			{
				text: "Enter the path to the executable",
				validateAndTransform: async (input) =>
				{
					if (!fs.existsSync(input))
					{
						throw new CliLib.RetryableError("File not found: " + input);
					}

					return input;
				},
			})
		: await CliLib.prompt(readlineInterface,
			{
				text: "Enter the URL to run",
				defaultValue: options.game.steamAppId != null
					? "steam://run/" + options.game.steamAppId
					: undefined,
				validateAndTransform: async (input) =>
				{
					if (!URL.canParse(input))
					{
						throw new CliLib.RetryableError("Invalid URL: " + input);
					}

					return input;
				},
			});

	const trackingPath = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the tracking path",
			validateAndTransform: async (input) =>
			{
				if (!fs.existsSync(input))
				{
					throw new CliLib.RetryableError("Path not found: " + input);
				}

				return input;
			},
		});

	// TODO: somehow allow specifying additional arguments here...

	return await prismaClient.gamePlayAction.create(
		{
			data:
			{
				name,
				type,
				path,
				trackingPath,

				game_id: options.game.id,
			},
		});
}