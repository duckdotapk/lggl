//
// Imports
//

import fs from "node:fs";
import path from "node:path";

import { prismaClient } from "../_shared/instances/prismaClient.js";

import * as SteamThirdPartyLib from "../_shared/libs/third-party/Steam.js";
import { Prisma } from "@prisma/client";

//
// Functions
//

async function downloadImage(game: Prisma.GameGetPayload<null>, url: string, type: "banner" | "cover" | "icon" | "logo")
{
	const imageResponse = await fetch(url);

	if (!imageResponse.ok)
	{
		return null;
	}

	const imagePath = "/data/game/" + game.id + "/" + type + ".jpg";

	const imagePathOnDisk = "./static" + imagePath;

	const imageBlob = await imageResponse.blob();

	const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());

	await fs.promises.mkdir(path.dirname(imagePathOnDisk), { recursive: true });

	await fs.promises.writeFile(imagePathOnDisk, imageBuffer);

	return imagePath;
}

async function main()
{
	const games = await prismaClient.game.findMany(
		{
			where:
			{
				steamAppId: { not: null },
			},
		});

	for (const game of games)
	{
		const steamAppId = game.steamAppId!;

		if (game.bannerImagePath != null && game.coverImagePath != null && game.iconImagePath != null && game.logoImagePath != null)
		{
			continue;
		}

		const imageUrls = await SteamThirdPartyLib.fetchImageUrls(steamAppId);

		const bannerImagePath = game.bannerImagePath == null
			? await downloadImage(game, imageUrls.libraryBackground, "banner")
			: null;

		const coverImagePath = game.coverImagePath == null
			? await downloadImage(game, imageUrls.libraryCapsule, "cover")
			: null;

		const iconImagePath = game.iconImagePath == null && imageUrls.icon != null
			? await downloadImage(game, imageUrls.icon, "icon")
			: null;

		const logoImagePath = game.logoImagePath == null 
			? await downloadImage(game, imageUrls.libraryLogo, "logo")
			: null;

		if (bannerImagePath == null && coverImagePath == null && iconImagePath == null && logoImagePath == null)
		{
			continue;
		}

		await prismaClient.game.update(
			{
				where:
				{
					id: game.id,
				},
				data:
				{
					bannerImagePath: bannerImagePath ?? undefined,
					coverImagePath: coverImagePath ?? undefined,
					iconImagePath: iconImagePath ?? undefined,
					logoImagePath: logoImagePath ?? undefined,
				},
			});
	}

	await prismaClient.$disconnect();
}

//
// Script
//

await main();