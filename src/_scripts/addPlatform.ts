//
// Imports
//

import { z } from "zod";

import { prismaClient } from "../_shared/instances/prismaClient.js";

import * as CliLib from "../_shared/libs/Cli.js";

//
// Functions
//

async function main()
{
	const name = await CliLib.prompt(
		{
			prompt: "Name",
			validateAndTransform: async (value) => z.string().trim().nonempty().parse(value),
		});

	const platform = await prismaClient.platform.create(
		{
			data:
			{
				name,
			},
		});

	console.log("Created platform #" + platform.id);
}

//
// Script
//

await main();