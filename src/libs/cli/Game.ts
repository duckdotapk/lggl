//
// Imports
//

import readline from "node:readline";

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";
import { z } from "zod";

import { LGGL_STEAM_API_KEY } from "../../env/LGGL_STEAM_API_KEY.js";
import { LGGL_STEAM_USER_ID } from "../../env/LGGL_STEAM_USER_ID.js";

import { prismaClient } from "../../instances/prismaClient.js";

import * as GameSchemaLib from "../schemas/Game.js";

import * as SteamThirdPartyLib from "../third-party/Steam.js";

import * as CliLib from "../Cli.js";
import * as NetworkLib from "../Network.js";

//
// Utility Functions
//

export type CreateOptions =
{
	steamAppDetails?: Extract<SteamThirdPartyLib.AppDetailsResponse["response"], { success: true }>["data"] | null;
	steamOwnedGame?: SteamThirdPartyLib.IPlayerServiceGetOwnedGamesResponse["response"]["games"][0] | null;
};

export async function create(readlineInterface: readline.promises.Interface, options: CreateOptions = {})
{	
	const name = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the game's name",
			defaultValue: options.steamOwnedGame?.name ?? options.steamAppDetails?.name ?? undefined,
			validateAndTransform: async (input) => input,
		});

	const sortName = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the game's sort name",
			defaultValue: name,
			validateAndTransform: async (input) => input,
		});

	// TODO: parse release date from options.steamAppDetails as a default value (if available)
	const releaseDate = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the game's release date in YYYY-MM-DD format",
			defaultValue: null,
			validateAndTransform: async (input) =>
			{
				const dateTime = DateTime.fromFormat(input, "yyyy-L-d");

				if (!dateTime.isValid)
				{
					throw new CliLib.RetryableError("Invalid date: " + input);
				}

				return dateTime.set({ hour: 12, minute: 0, second: 0 }).toJSDate();
			},
		});

	const isEarlyAccess = await CliLib.confirm(readlineInterface, { text: "Is this game in early access?", defaultValue: false });

	const isFavorite = await CliLib.confirm(readlineInterface, { text: "Is this game a favorite?", defaultValue: false });

	const isHidden = await CliLib.confirm(readlineInterface, { text: "Is this game hidden?",  defaultValue: false });

	const isNsfw = await CliLib.confirm(readlineInterface, { text: "Is this game NSFW?",  defaultValue: false });

	const isShelved = await CliLib.confirm(readlineInterface, { text: "Is this game shelved?",  defaultValue: false });

	const progressionType = await CliLib.prompt(readlineInterface,
		{
			text: "What kind of progression does this game have?",
			defaultValue: null,
			options: GameSchemaLib.ProgressionTypeSchema.options.map((progressionType) => ({ value: progressionType })),
			validateAndTransform: async (input) => GameSchemaLib.ProgressionTypeSchema.parse(input.toUpperCase()),
		});

	const achievementSupport = await CliLib.prompt(readlineInterface,
		{
			text: "What kind of achievement support does this game have?",
			defaultValue: null,
			options: GameSchemaLib.AchievementSupportSchema.options.map((achievementSupport) => ({ value: achievementSupport })),
			validateAndTransform: async (input) => GameSchemaLib.AchievementSupportSchema.parse(input.toUpperCase()),
		});

	const controllerSupport = await CliLib.prompt(readlineInterface,
		{
			text: "What kind of controller support does this game have?",
			defaultValue: null,
			options: GameSchemaLib.ControllerSupportSchema.options.map((controllerSupport) => ({ value: controllerSupport })),
			validateAndTransform: async (input) => GameSchemaLib.ControllerSupportSchema.parse(input.toUpperCase()),
		});

	const modSupport = await CliLib.prompt(readlineInterface,
		{
			text: "What kind of mod support does this game have?",
			defaultValue: null,
			options: GameSchemaLib.ModSupportSchema.options.map((modSupport) => ({ value: modSupport })),
			validateAndTransform: async (input) => GameSchemaLib.ModSupportSchema.parse(input.toUpperCase()),
		});

	const virtualRealitySupport = await CliLib.prompt(readlineInterface,
		{
			text: "What kind of virtual reality support does this game have?",
			defaultValue: null,
			options: GameSchemaLib.VirtualRealitySupportSchema.options.map((virtualRealitySupport) => ({ value: virtualRealitySupport })),
			validateAndTransform: async (input) => GameSchemaLib.VirtualRealitySupportSchema.parse(input.toUpperCase()),
		});

	return await prismaClient.game.create(
		{
			data:
			{
				name,
				sortName,
				releaseDate,

				isEarlyAccess,
				isFavorite,
				isHidden,
				isInstalled: false,
				isNsfw,
				isShelved,

				progressionType,
				completionStatus: null,
				firstPlayedDate: null,
				firstPlayedDateApproximated: false,
				firstCompletedDate: null,
				firstCompletedDateApproximated: false,
				lastPlayedDate: null,
				playCount: 0,
				playTimeTotalSeconds: 0,

				achievementSupport,
				controllerSupport,
				modSupport,
				virtualRealitySupport,

				steamAppId: options.steamAppDetails?.steam_appid ?? null,
				steamAppName: options.steamOwnedGame?.name ?? null, // Note: does not use the appDetails because that isn't always the library name
			},
		});
}

export async function search(readlineInterface: readline.promises.Interface)
{
	return await CliLib.prompt(readlineInterface,
		{
			text: "Search for a game",
			validateAndTransform: async (input) => await prismaClient.game.findMany(
				{
					where:
					{
						name: { contains: input },
					},
					orderBy:
					{
						sortName: "asc",
					},
				}),
		});
}

export async function choose(readlineInterface: readline.promises.Interface, games: Prisma.GameGetPayload<null>[])
{
	return await CliLib.prompt(readlineInterface,
		{
			text: "Choose a game",
			options: games.map((game) => ({ value: game.id.toString(), description: game.name })),
			validateAndTransform: async (input) =>
			{
				const id = z.coerce.number().int().min(1).parse(input);

				const game = games.find((game) => game.id == id);

				if (game == null)
				{
					throw new CliLib.RetryableError("No game found with that ID.");
				}

				return game;
			},
		});
}

export async function searchAndChooseOne(readlineInterface: readline.promises.Interface)
{
	while (true)
	{
		const games = await search(readlineInterface);

		if (games.length == 0)
		{
			console.log("No games found. Please try again.");

			continue;
		}
		else if (games.length == 1)
		{
			return games[0]!;
		}

		return await choose(readlineInterface, games);
	}
}

export async function downloadImagesFromSteam(readlineInterface: readline.promises.Interface, game: Prisma.GameGetPayload<null>)
{
	const steamAppId = game.steamAppId ?? await CliLib.prompt(readlineInterface,
		{
			text: "Enter steam app ID to use for downloading images",
			defaultValue: null,
			validateAndTransform: async (input) => z.number().min(1).parse(input),
		});

	if (steamAppId == null)
	{
		return 0;
	}

	const imageUrls = await SteamThirdPartyLib.fetchImageUrls(LGGL_STEAM_API_KEY, LGGL_STEAM_USER_ID, steamAppId);

	const bannerDownloaded = await NetworkLib.downloadUrl(imageUrls.libraryBackground, [ "images", "games", game.id.toString(), "banner.jpg" ]);

	const coverDownloaded = await NetworkLib.downloadUrl(imageUrls.libraryCapsule, [ "images", "games", game.id.toString(), "cover.jpg" ]);

	const iconDownloaded = imageUrls.icon != null 
		? await NetworkLib.downloadUrl(imageUrls.icon, [ "images", "games", game.id.toString(), "icon.jpg" ])
		: false;

	const logoDownloaded = await NetworkLib.downloadUrl(imageUrls.libraryLogo, [ "images", "games", game.id.toString(), "logo.png" ]);

	await prismaClient.game.update(
		{
			where:
			{
				id: game.id,
			},
			data:
			{
				hasBannerImage: bannerDownloaded,
				hasCoverImage: coverDownloaded,
				hasIconImage: iconDownloaded,
				hasLogoImage: logoDownloaded,
			},
		});

	return Number(bannerDownloaded) + Number(coverDownloaded) + Number(iconDownloaded) + Number(logoDownloaded);
}