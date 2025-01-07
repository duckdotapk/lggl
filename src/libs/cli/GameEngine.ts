//
// Imports
//

import readline from "node:readline";

import { Prisma } from "@prisma/client";

import { prismaClient } from "../../instances/prismaClient.js";

import * as CliLib from "../Cli.js";

//
// Utility Functions
//

export type CreateOptions =
{
	game: Prisma.GameGetPayload<null>;
	engine: Prisma.EngineGetPayload<null>;
};

export async function create(readlineInterface: readline.promises.Interface, options: CreateOptions)
{
	const notes = await CliLib.prompt(readlineInterface,
		{
			text: "Enter notes for this engine",
			defaultValue: null,
			validateAndTransform: async (input) => input,
		});

	const version = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the engine version",
			defaultValue: null,
			validateAndTransform: async (input) => input,
		});

	return await prismaClient.gameEngine.create(
		{
			data:
			{
				notes,
				version,

				engine_id: options.engine.id,
				game_id: options.game.id,
			},
		});
}