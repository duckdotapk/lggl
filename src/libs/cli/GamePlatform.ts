//
// Imports
//

import { Prisma } from "@prisma/client";

import { prismaClient } from "../../instances/prismaClient.js";

//
// Utility Functions
//

export type CreateOptions =
{
	game: Prisma.GameGetPayload<null>;
	platform: Prisma.PlatformGetPayload<null>;
};

export async function create(options: CreateOptions)
{
	return await prismaClient.gamePlatform.create(
		{
			data:
			{
				game_id: options.game.id,
				platform_id: options.platform.id,
			},
		});
}