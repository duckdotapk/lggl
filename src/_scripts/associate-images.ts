//
// Imports
//

import "source-map-support/register.js";

import fs from "node:fs";

import { Prisma } from "@prisma/client";

import { prismaClient } from "../_shared/instances/prismaClient.js";

//
// Functions
//

async function main()
{
	const games = await prismaClient.game.findMany(
		{
			orderBy:
			{
				id: "asc",
			},
		});

	for (const game of games)
	{
		let numberOfNullImagePaths =
			(game.bannerImagePath == null ? 1 : 0) +
			(game.coverImagePath == null ? 1 : 0) +
			(game.iconImagePath == null ? 1 : 0) +
			(game.logoImagePath == null ? 1 : 0);

		if (numberOfNullImagePaths == 0)
		{
			continue;
		}

		const gameUpdateData: Prisma.GameUpdateArgs["data"] = {};

		if (game.bannerImagePath == null && fs.existsSync("./static/data/game/" + game.id + "/banner.jpg"))
		{
			gameUpdateData.bannerImagePath = "/data/game/" + game.id + "/banner.jpg";
		}

		if (game.coverImagePath == null && fs.existsSync("./static/data/game/" + game.id + "/cover.jpg"))
		{
			gameUpdateData.coverImagePath = "/data/game/" + game.id + "/cover.jpg";
		}

		if (game.iconImagePath == null && fs.existsSync("./static/data/game/" + game.id + "/icon.jpg"))
		{
			gameUpdateData.iconImagePath = "/data/game/" + game.id + "/icon.jpg";
		}

		if (game.logoImagePath == null && fs.existsSync("./static/data/game/" + game.id + "/logo.jpg"))
		{
			gameUpdateData.logoImagePath = "/data/game/" + game.id + "/logo.jpg";
		}

		const numberOfUpdatedImagePaths = Object.keys(gameUpdateData).length;

		if (numberOfUpdatedImagePaths == 0)
		{
			console.log("No new images found for game #%s (%s), %s still needed", game.id, game.name, numberOfNullImagePaths);

			continue;
		}

		console.log("Updating game #%s (%s) with %s new image paths...", game.id, game.name, numberOfUpdatedImagePaths);

		await prismaClient.game.update(
			{
				where:
				{
					id: game.id,
				},
				data: gameUpdateData,
			});
	}
}

//
// Script
//

await main();