//
// Imports
//

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

import { Prisma } from "@prisma/client";
import chalk from "chalk";
import { DateTime } from "luxon";
import { z } from "zod";

import { LGGL_DATA_DIRECTORY } from "./env/LGGL_DATA_DIRECTORY.js";
import { LGGL_PLATFORM_ID_LINUX } from "./env/LGGL_PLATFORM_ID_LINUX.js";
import { LGGL_PLATFORM_ID_MAC } from "./env/LGGL_PLATFORM_ID_MAC.js";
import { LGGL_PLATFORM_ID_WINDOWS } from "./env/LGGL_PLATFORM_ID_WINDOWS.js";
import { LGGL_STEAM_API_KEY } from "./env/LGGL_STEAM_API_KEY.js";
import { LGGL_STEAM_USER_ID } from "./env/LGGL_STEAM_USER_ID.js";

import { prismaClient } from "./instances/prismaClient.js";

import * as GameModelLib from "./libs/models/Game.js";

import * as GameSchemaLib from "./libs/schemas/Game.js";
import * as GamePlayActionSchemaLib from "./libs/schemas/GamePlayAction.js";

import * as SteamThirdPartyLib from "./libs/third-party/Steam.js";

import * as CliLib from "./libs/Cli.js";
import * as FileSizeLib from "./libs/FileSize.js";

//
// Utility Functions
//

async function downloadGameImage(url: string, game: Prisma.GameGetPayload<null>, type: "banner" | "cover" | "icon" | "logo")
{
	const imageResponse = await fetch(url);

	if (!imageResponse.ok)
	{
		return false;
	}

	const imageBlob = await imageResponse.blob();

	const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());

	const imagePath = path.join(LGGL_DATA_DIRECTORY, "images", "games", game.id.toString(), type + path.extname(url));

	await fs.promises.mkdir(path.dirname(imagePath), { recursive: true });

	await fs.promises.writeFile(imagePath, imageBuffer);

	return true;
}

async function searchForEngine(readlineInterface: readline.promises.Interface)
{
	const engines = await prismaClient.engine.findMany(
		{
			orderBy:
			{
				name: "asc",
			},
		});

	const engine = await CliLib.prompt(readlineInterface,
		{
			text: "Choose an engine",
			options: engines.map(
				(engine) =>
				{
					return {
						value: engine.id.toString(),
						description: engine.name,
					};
				}),
			validateAndTransform: async (input) =>
			{
				const inputParseResult = z.number().int().min(1).safeParse(parseInt(input));

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid engine ID.");
				}

				const id = inputParseResult.data;

				const engine = engines.find((engine) => engine.id == id);

				if (engine == null)
				{
					throw new CliLib.RetryableError("No engine found with that ID.");
				}

				return engine;
			},
		});

	return engine;
}

async function searchForGame(readlineInterface: readline.promises.Interface)
{
	const games = await CliLib.prompt(readlineInterface,
		{
			text: "Search for a game by name",
			validateAndTransform: async (input) =>
			{
				const games = await prismaClient.game.findMany(
					{
						where:
						{
							name: { contains: input },
						},
						include:
						{
							gamePlayActions: true,
						},
						orderBy:
						{
							id: "asc",
						},
					});

				if (games.length == 0)
				{
					throw new CliLib.RetryableError("No games found.");
				}

				return games;
			},
		});

	const game = await CliLib.prompt(readlineInterface,
		{
			text: "Choose a game",
			options: games.map(
				(game) =>
				{
					return {
						value: game.id.toString(),
						description: game.name,
					};
				}),
			validateAndTransform: async (input) =>
			{
				const inputParseResult = z.number().int().min(1).safeParse(parseInt(input));

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid game ID.");
				}

				const id = inputParseResult.data;

				const game = games.find((game) => game.id == id);

				if (game == null)
				{
					throw new CliLib.RetryableError("No game found with that ID.");
				}

				return game;
			},
		});

	return game;
}

async function searchForSeries(readlineInterface: readline.promises.Interface)
{
	const seriesList = await CliLib.prompt(readlineInterface,
		{
			text: "Search for a series by name",
			validateAndTransform: async (input) =>
			{
				const series = await prismaClient.series.findMany(
					{
						where:
						{
							name: { contains: input },
						},
						orderBy:
						{
							id: "asc",
						},
					});

				if (series.length == 0)
				{
					throw new CliLib.RetryableError("No series found.");
				}

				return series;
			},
		});

	const series = await CliLib.prompt(readlineInterface,
		{
			text: "Choose a series",
			options: seriesList.map(
				(series) =>
				{
					return {
						value: series.id.toString(),
						description: series.name,
					};
				}),
			validateAndTransform: async (input) =>
			{
				const inputParseResult = z.number().int().min(1).safeParse(parseInt(input));

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid series ID.");
				}

				const id = inputParseResult.data;

				const series = seriesList.find((series) => series.id == id);

				if (series == null)
				{
					throw new CliLib.RetryableError("No series found with that ID.");
				}

				return series;
			},
		});

	return series;
}

//
// Actions
//

async function addEngine(readlineInterface: readline.promises.Interface)
{
	const name = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the engine's name",
			validateAndTransform: async (input) => input,
		});

	const engine = await prismaClient.engine.create(
		{
			data:
			{
				name,
			},
		});

	console.log("Engine #%d created!", engine.id);

	await CliLib.pause(readlineInterface);
}

async function addGame(readlineInterface: readline.promises.Interface)
{
	//
	// Get Steam App ID
	//

	const steamAppId = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the game's steam app ID or store page URL",
			defaultValue: null,
			validateAndTransform: async (input) =>
			{
				if (URL.canParse(input))
				{
					const url = new URL(input);

					const urlPathComponents = url.pathname.split("/");

					input = urlPathComponents[2] ?? "";
				}

				const inputParseResult = z.number().min(1).safeParse(parseInt(input));

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid steam app ID: " + input);
				}

				return inputParseResult.data;
			},
		});

	let appDetails: Extract<SteamThirdPartyLib.AppDetailsResponse["response"], { success: true }>["data"] | null = null;
	let ownedGame: SteamThirdPartyLib.IPlayerServiceGetOwnedGamesResponse["response"]["games"][0] | null = null;

	if (steamAppId != null)
	{
		appDetails = await SteamThirdPartyLib.fetchAppDetails(steamAppId);

		const ownedGames = await SteamThirdPartyLib.fetchOwnedGames(LGGL_STEAM_API_KEY, LGGL_STEAM_USER_ID);

		ownedGame = ownedGames.games.find((game) => game.appid == steamAppId) ?? null;
	}

	//
	// Get Game Data
	//

	const name = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the game's name",
			defaultValue: ownedGame?.name ?? appDetails?.name ?? undefined,
			validateAndTransform: async (input) => input,
		});

	const sortName = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the game's sort name",
			defaultValue: name,
			validateAndTransform: async (input) => input,
		});

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
			validateAndTransform: async (input) =>
			{
				const inputParseResult = GameSchemaLib.ProgressionTypeSchema.safeParse(input);

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid progression type: " + input);
				}

				return inputParseResult.data;
			}
		});

	let completionStatus: GameSchemaLib.CompletionStatus | null = null;

	let firstPlayedDate: Date | null = null;

	let firstPlayedDateApproximated = false;

	let firstCompletedDate: Date | null = null;

	let firstCompletedDateApproximated = false;

	let lastPlayedDate: Date | null = null;

	let playCount = 0;

	let playTimeTotalSeconds = 0;

	const hasPlayed = await CliLib.confirm(readlineInterface,
		{
			text: "Have you played this game?",
			defaultValue: false,
		});

	if (hasPlayed)
	{
		// TODO: prompts to fill the above fields
	}

	const achievementSupport = await CliLib.prompt(readlineInterface,
		{
			text: "What kind of achievement support does this game have?",
			defaultValue: null,
			options: GameSchemaLib.AchievementSupportSchema.options.map((achievementSupport) => ({ value: achievementSupport })),
			validateAndTransform: async (input) =>
			{
				const inputParseResult = GameSchemaLib.AchievementSupportSchema.safeParse(input);

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid achievement support: " + input);
				}

				return inputParseResult.data;
			},
		});

	const controllerSupport = await CliLib.prompt(readlineInterface,
		{
			text: "What kind of controller support does this game have?",
			defaultValue: null,
			options: GameSchemaLib.ControllerSupportSchema.options.map((controllerSupport) => ({ value: controllerSupport })),
			validateAndTransform: async (input) =>
			{
				const inputParseResult = GameSchemaLib.ControllerSupportSchema.safeParse(input);

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid controller support: " + input);
				}

				return inputParseResult.data;
			},
		});

	const modSupport = await CliLib.prompt(readlineInterface,
		{
			text: "What kind of mod support does this game have?",
			defaultValue: null,
			options: GameSchemaLib.ModSupportSchema.options.map((modSupport) => ({ value: modSupport })),
			validateAndTransform: async (input) =>
			{
				const inputParseResult = GameSchemaLib.ModSupportSchema.safeParse(input);

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid mod support: " + input);
				}

				return inputParseResult.data;
			},
		});

	const virtualRealitySupport = await CliLib.prompt(readlineInterface,
		{
			text: "What kind of virtual reality support does this game have?",
			defaultValue: null,
			options: GameSchemaLib.VirtualRealitySupportSchema.options.map((virtualRealitySupport) => ({ value: virtualRealitySupport })),
			validateAndTransform: async (input) =>
			{
				const inputParseResult = GameSchemaLib.VirtualRealitySupportSchema.safeParse(input);

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid virtual reality support: " + input);
				}

				return inputParseResult.data;
			},
		});

	//
	// Get Game Developers Names
	//

	const developerCompanyNames = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the game's developers (separate multiple developers with ' | ')",
			defaultValue: appDetails?.developers ?? [],
			validateAndTransform: async (input) =>
			{
				const developers = input.split(" | ").map((developer) => developer.trim());

				return developers;
			},
		});

	//
	// Get Game Publishers Names
	//

	const publisherCompanyNames = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the game's publishers (separate multiple publishers with ' | ')",
			defaultValue: appDetails?.publishers ?? [],
			validateAndTransform: async (input) =>
			{
				const publishers = input.split(" | ").map((publisher) => publisher.trim());

				return publishers;
			},
		});

	//
	// Create Game Engine
	//

	const engines = await prismaClient.engine.findMany(
		{
			orderBy:
			{
				name: "asc",
			},
		});

	const engineIds = await CliLib.prompt(readlineInterface,
		{
			text: "What engine does this game use? (separate multiple engines with ',')",
			defaultValue: [],
			options: engines.map(
				(engine) =>
				{
					return {
						value: engine.id.toString(),
						description: engine.name,
					};
				}),
			validateAndTransform: async (input) =>
			{
				const inputParseResult = z.array(z.coerce.number().int().min(1)).safeParse(input.split(","));

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid engine IDs: " + input);
				}

				for (const engineId of inputParseResult.data)
				{
					const engine = engines.find((engine) => engine.id == engineId);

					if (engine == null)
					{
						throw new CliLib.RetryableError("No engine found with ID: " + engineId);
					}
				}

				return inputParseResult.data;
			},
		});

	//
	// Create Game Platform
	//

	let platformIds: number[] = [];

	if (appDetails != null)
	{
		if (appDetails.platforms.windows)
		{
			platformIds.push(LGGL_PLATFORM_ID_WINDOWS);
		}

		if (appDetails.platforms.mac)
		{
			platformIds.push(LGGL_PLATFORM_ID_MAC);
		}

		if (appDetails.platforms.linux)
		{
			platformIds.push(LGGL_PLATFORM_ID_LINUX);
		}
	}
	else
	{
		const platforms = await prismaClient.platform.findMany(
			{
				orderBy:
				{
					name: "asc",
				},
			});

		platformIds = await CliLib.prompt(readlineInterface,
			{
				text: "What platform is this game for? (separate multiple platforms with ',')",
				options: platforms.map(
					(platform) =>
					{
						return {
							value: platform.id.toString(),
							description: platform.name,
						};
					}),
				validateAndTransform: async (input) =>
				{
					const inputParseResult = z.array(z.coerce.number().int().min(1)).safeParse(input.split(","));

					if (!inputParseResult.success)
					{
						throw new CliLib.RetryableError("Invalid platform ID.");
					}

					for (const platformId of inputParseResult.data)
					{
						const platform = platforms.find((platform) => platform.id == platformId);

						if (platform == null)
						{
							throw new CliLib.RetryableError("No platform found with ID: " + platformId);
						}
					}

					return inputParseResult.data;
				},
			});
	}

	//
	// Create Game Installation
	//

	const gameInstallationPath = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the game's installation path",
			defaultValue: null,
			validateAndTransform: async (input) =>
			{
				if (input == "")
				{
					return null;
				}

				if (!fs.existsSync(input))
				{
					throw new CliLib.RetryableError("Path does not exist.");
				}

				return input;
			},
		});

	//
	// Create Data
	//

	await prismaClient.$transaction(
		async (transactionClient) =>
		{
			//
			// Create Game
			//

			const game = await transactionClient.game.create(
				{
					data:
					{
						name,
						sortName,
						releaseDate,

						isEarlyAccess,
						isFavorite,
						isHidden,
						isInstalled: gameInstallationPath != null,
						isNsfw,
						isShelved,

						progressionType,
						completionStatus,
						firstPlayedDate,
						firstPlayedDateApproximated,
						firstCompletedDate,
						firstCompletedDateApproximated,
						lastPlayedDate,
						playCount,
						playTimeTotalSeconds,

						achievementSupport,
						controllerSupport,
						modSupport,
						virtualRealitySupport,

						steamAppId,
						steamAppName: ownedGame?.name ?? null, // Note: does not use the appDetails because that isn't always the library name
					},
				});

			console.log("Game #%d (%s) created!", game.id, game.name);

			//
			// Download Images from Steam
			//

			if (steamAppId != null)
			{
				const ownedGames = await SteamThirdPartyLib.fetchOwnedGames(LGGL_STEAM_API_KEY, LGGL_STEAM_USER_ID);
		
				const ownedGame = ownedGames.games.find((game) => game.appid == steamAppId) ?? null;
		
				const imageUrls = SteamThirdPartyLib.fetchImageUrls(steamAppId, ownedGame);
		
				await transactionClient.game.update(
					{
						where:
						{
							id: game.id,
						},
						data:
						{
							hasBannerImage: await downloadGameImage(imageUrls.libraryBackground, game, "banner"),
							hasCoverImage: await downloadGameImage(imageUrls.libraryCapsule, game, "cover"),
							hasIconImage: imageUrls.icon != null 
								? await downloadGameImage(imageUrls.icon, game, "icon")
								: false,
							hasLogoImage: await downloadGameImage(imageUrls.libraryLogo, game, "logo"),
						},
					});
		
				const numberOfImagesDownloaded = Object.values(imageUrls).filter((url) => url != null).length;
		
				console.log("Downloaded %d images from Steam!", numberOfImagesDownloaded);
			}

			//
			// Create Game Developers
			//

			for (const companyName of developerCompanyNames)
			{
				const company = await transactionClient.company.upsert(
					{
						where:
						{
							name: companyName,
						},
						create:
						{
							name: companyName,
						},
						update: {},
					})
	
				const gameDeveloper = await transactionClient.gameDeveloper.create(
					{
						data:
						{
							company_id: company.id,
							game_id: game.id,
						},
					});
	
				console.log("Game developer #%d created!", gameDeveloper.id);
			}

			//
			// Create Game Publishers
			//

			for (const companyName of publisherCompanyNames)
			{
				const company = await transactionClient.company.upsert(
					{
						where:
						{
							name: companyName,
						},
						create:
						{
							name: companyName,
						},
						update: {},
					})
	
				const gamePublisher = await transactionClient.gamePublisher.create(
					{
						data:
						{
							company_id: company.id,
							game_id: game.id,
						},
					});
	
				console.log("Game publisher #%d created!", gamePublisher.id);
			}

			//
			// Create Game Engines
			//

			for (const engineId of engineIds)
			{
				const gameEngine = await transactionClient.gameEngine.create(
					{
						data:
						{
							engine_id: engineId,
							game_id: game.id,
						},
					});
		
				console.log("Game engine #%d created!", gameEngine.id);
			}
			
			//
			// Create Game Platforms
			//
			
			for (const platformId of platformIds)
			{
				const gamePlatform = await transactionClient.gamePlatform.create(
					{
						data:
						{
							game_id: game.id,
							platform_id: platformId,
						},
					});

				console.log("Game platform #%d created!", gamePlatform.id);
			}

			//
			// Create Game Installation
			//

			if (gameInstallationPath != null)
			{		
				const gameInstallationSize = await FileSizeLib.getFolderSize(gameInstallationPath);
		
				const [ fileSizeGibiBytes, fileSizeBytes ] = FileSizeLib.toGibiBytesAndBytes(gameInstallationSize);
		
				const gameInstallation = await transactionClient.gameInstallation.create(
					{
						data:
						{
							path: gameInstallationPath,
							fileSizeGibiBytes,
							fileSizeBytes,
		
							game_id: game.id,
						},
					});
		
				console.log("Game installation #%d created!", gameInstallation.id);
			}

			//
			// Create Game Play Action
			//
			
			if (steamAppId != null && gameInstallationPath != null)
			{
				const gamePlayAction = await transactionClient.gamePlayAction.create(
					{
						data:
						{
							name: "Play",
							type: "URL" satisfies GamePlayActionSchemaLib.Type,
							path: "steam://run/" + game.steamAppId,
							trackingPath: gameInstallationPath,
		
							game_id: game.id,
						},
					});
		
				console.log("Game play action #%d created!", gamePlayAction.id);
			}
		});

	//
	// Pause
	//

	await CliLib.pause(readlineInterface);
}

async function downloadGameImagesFromSteam(readlineInterface: readline.promises.Interface)
{
	const game = await searchForGame(readlineInterface);

	//
	// Get Steam App ID
	//

	let steamAppId = game.steamAppId;

	if (steamAppId == null)
	{
		steamAppId = await CliLib.prompt(readlineInterface,
			{
				text: "No steam app ID for game, enter one to use",
				validateAndTransform: async (input) =>
				{
					const inputParseResult = z.number().min(1).safeParse(parseInt(input));

					if (!inputParseResult.success)
					{
						throw new CliLib.RetryableError("Invalid steam app ID: " + input);
					}

					return inputParseResult.data;
				},
			});
	}

	const ownedGames = await SteamThirdPartyLib.fetchOwnedGames(LGGL_STEAM_API_KEY, LGGL_STEAM_USER_ID);

	const ownedGame = ownedGames.games.find((game) => game.appid == steamAppId) ?? null;

	const imageUrls = SteamThirdPartyLib.fetchImageUrls(steamAppId, ownedGame);

	const bannerDownloaded = await downloadGameImage(imageUrls.libraryBackground, game, "banner");

	const coverDownloaded = await downloadGameImage(imageUrls.libraryCapsule, game, "cover");

	const iconDownloaded = imageUrls.icon != null
		? await downloadGameImage(imageUrls.icon, game, "icon")
		: false;

	const logoDownloaded = await downloadGameImage(imageUrls.libraryLogo, game, "logo");

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

	console.log("Images downloaded!");

	await CliLib.pause(readlineInterface);
}

async function addGameEngine(readlineInterface: readline.promises.Interface)
{
	const game = await searchForGame(readlineInterface);

	const engine = await searchForEngine(readlineInterface);

	const gameEngine = await prismaClient.gameEngine.create(
		{
			data:
			{
				engine_id: engine.id,
				game_id: game.id,
			},
		});

	console.log("Game engine #%d created!", gameEngine.id);

	await CliLib.pause(readlineInterface);
}

async function addGameInstallation(readlineInterface: readline.promises.Interface)
{
	const game = await searchForGame(readlineInterface);

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
	
		const gameInstallation = await prismaClient.gameInstallation.create(
			{
				data:
				{
					path: gameInstallationPath,
					fileSizeGibiBytes,
					fileSizeBytes,
	
					game_id: game.id,
				},
			});

	console.log("Game installation #%d created!", gameInstallation.id);

	await CliLib.pause(readlineInterface);
}

async function addGamePlaySession(readlineInterface: readline.promises.Interface)
{
	const game = await searchForGame(readlineInterface);

	const platforms = await prismaClient.platform.findMany(
		{
			orderBy:
			{
				id: "asc",
			},
		});

	const platform = await CliLib.prompt(readlineInterface, 
		{
			text: "Enter the ID of the platform this playtime is from",
			options: platforms.map(
				(platform) =>
				{
					return {
						value: platform.id.toString(),
						description: platform.name,
					};
				}),
			validateAndTransform: async (input) =>
			{
				const inputParseResult = z.number().int().min(1).safeParse(parseInt(input));

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid platform ID.");
				}

				const id = inputParseResult.data;

				const platform = platforms.find((platform) => platform.id == id);

				if (platform == null)
				{
					throw new CliLib.RetryableError("No platform found with that ID.");
				}

				return platform;
			},
		});

	const playTimeSeconds = await CliLib.prompt(readlineInterface, 
		{
			text: "Enter the playtime in HH:MM:SS format",
			validateAndTransform: async (input) =>
			{
				const inputComponents = input.split(":").map((component) => parseInt(component));

				const inputComponentsParseResult = z.tuple([ z.number().int(), z.number().int(), z.number().int() ]).safeParse(inputComponents);

				if (!inputComponentsParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid playtime format.");
				}

				const [ hours, minutes, seconds ] = inputComponentsParseResult.data;

				return (hours * 60 * 60) + (minutes * 60) + seconds;
			},
		});

	const notes = await CliLib.prompt(readlineInterface, 
		{
			text: "Enter any notes you want to add to this playtime",
			validateAndTransform: async (input) =>
			{
				return input.length > 0 ? input : null;
			},
		});

	readlineInterface.close();

	const gamePlaySession = await prismaClient.$transaction(
		async (transactionClient) =>
		{
			await transactionClient.game.update(
				{
					where:
					{
						id: game.id,
					},
					data:
					{
						playTimeTotalSeconds: { increment: playTimeSeconds },
					},
				});

			return await transactionClient.gamePlaySession.create(
				{
					data:
					{
						startDate: DateTime.fromSeconds(0).toJSDate(),
						endDate: DateTime.fromSeconds(playTimeSeconds).toJSDate(),
						playTimeSeconds,
						addedToTotal: true,
						isHistorical: true,
						notes,
		
						game_id: game.id,
						platform_id: platform.id,
					},
				});
		});

	console.log("Created historical game play session with ID: %d", gamePlaySession.id);

	await CliLib.pause(readlineInterface);
}

async function addSeriesGame(readlineInterface: readline.promises.Interface)
{
	const game = await searchForGame(readlineInterface);

	const series = await searchForSeries(readlineInterface);

	const seriesGameNumber = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the game's number in the series",
			validateAndTransform: async (input) =>
			{
				const inputParseResult = z.number().int().min(1).safeParse(parseInt(input));

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid series game number.");
				}

				return inputParseResult.data;
			},
		});

	const seriesGame = await prismaClient.seriesGame.create(
		{
			data:
			{
				number: seriesGameNumber,

				game_id: game.id,
				series_id: series.id,
			},
		});

	console.log("Series game #%d created!", seriesGame.id);

	await CliLib.pause(readlineInterface);
}

async function audit(readlineInterface: readline.promises.Interface)
{
	const shouldFixData = await CliLib.confirm(readlineInterface,
		{
			text: "Would you like automatically fix issues where possible?",
			defaultValue: false,
		});

	const strictMode = await CliLib.confirm(readlineInterface,
		{
			text: "Would you like to enable strict mode?",
			defaultValue: false,
		});

	const games = await prismaClient.game.findMany(
		{
			orderBy:
			{
				id: "asc",
			},
		});

	for (const game of games)
	{
		const imagePaths = GameModelLib.getImagePaths(game);

		const problems: string[] = [];

		//
		// Check Game Model
		//

		if (game.releaseDate == null)
		{
			problems.push("releaseDate is null");
		}

		if (strictMode && game.description == null)
		{
			problems.push(chalk.red("STRICT"), "description is null");
		}

		if (game.hasBannerImage && !fs.existsSync(imagePaths.banner!))
		{
			problems.push("hasBannerImage is true but banner image does not exist on disk");

			if (shouldFixData)
			{
				problems[problems.length - 1] += " (FIXED)";

				await prismaClient.game.update(
					{
						where:
						{
							id: game.id,
						},
						data:
						{
							hasBannerImage: false,
						},
					});
			}
		}

		if (game.hasCoverImage && !fs.existsSync(imagePaths.cover!))
		{
			problems.push("hasCoverImage is true but cover image does not exist on disk");

			if (shouldFixData)
			{
				problems[problems.length - 1] += " (FIXED)";

				await prismaClient.game.update(
					{
						where:
						{
							id: game.id,
						},
						data:
						{
							hasCoverImage: false,
						},
					});
			}
		}

		if (game.hasIconImage && !fs.existsSync(imagePaths.icon!))
		{
			problems.push("hasIconImage is true but icon image does not exist on disk");

			if (shouldFixData)
			{
				problems[problems.length - 1] += " (FIXED)";

				await prismaClient.game.update(
					{
						where:
						{
							id: game.id,
						},
						data:
						{
							hasIconImage: false,
						},
					});
			}
		}

		if (game.hasLogoImage && !fs.existsSync(imagePaths.logo!))
		{
			problems.push("hasLogoImage is true but logo image does not exist on disk");

			if (shouldFixData)
			{
				problems[problems.length - 1] += " (FIXED)";

				await prismaClient.game.update(
					{
						where:
						{
							id: game.id,
						},
						data:
						{
							hasLogoImage: false,
						},
					});
			}
		}

		if (game.progressionType == null)
		{
			problems.push("progressionType is null");
		}

		if (strictMode && game.completionStatus == null)
		{
			problems.push("completionStatus is null");
		}
		
		if (game.completionStatus == "TODO" && game.playCount > 0)
		{
			problems.push("completionStatus is TODO but playCount is greater than 0");
		}

		if (game.completionStatus == "TODO" && game.playTimeTotalSeconds > 0)
		{
			problems.push("completionStatus is TODO but playTimeTotalSeconds is greater than 0");

			if (shouldFixData)
			{
				problems[problems.length - 1] += " (FIXED)";

				await prismaClient.game.update(
					{
						where:
						{
							id: game.id,
						},
						data:
						{
							completionStatus: "IN_PROGRESS",
						},
					});
			}
		}

		if (game.steamAppId != null && game.steamAppName == null)
		{
			problems.push("steamAppId is set but steamAppName is null");
		}

		//
		// Check Game Developers
		//

		if (strictMode)
		{
			const gameDevelopers = await prismaClient.gameDeveloper.findMany(
				{
					where:
					{
						game_id: game.id,
					},
				});
	
			if (gameDevelopers.length == 0)
			{
				problems.push("no gameDevelopers");
			}
		}

		//
		// Check Game Engines
		//

		if (strictMode)
		{
			const gameEngines = await prismaClient.gameEngine.findMany(
				{
					where:
					{
						game_id: game.id,
					},
				});

			if (gameEngines.length == 0)
			{
				problems.push("no gameEngines");
			}
		}

		//
		// Check Game Installations
		//

		let gameInstallations = await prismaClient.gameInstallation.findMany(
			{
				where:
				{
					game_id: game.id,
				},
			});

		for (const gameInstallation of gameInstallations)
		{
			if (!fs.existsSync(gameInstallation.path))
			{
				problems.push("gameInstallation #" + gameInstallation.id + ": path does not exist: " + gameInstallation.path);

				if (!shouldFixData)
				{
					problems[problems.length - 1] += " (FIXABLE: gameInstallation can be deleted)";
				}
				else
				{
					problems[problems.length - 1] += " (FIXED: gameInstallation deleted)";

					await prismaClient.gameInstallation.delete(
						{
							where:
							{
								id: gameInstallation.id,
							},
						});
				}
			}
		}

		gameInstallations = await prismaClient.gameInstallation.findMany(
			{
				where:
				{
					game_id: game.id,
				},
			});

		if (game.isInstalled)
		{
			if (gameInstallations.length == 0)
			{
				problems.push("isInstalled is true but game has no gameInstallations");
			}
		}
		else
		{
			if (gameInstallations.length > 0)
			{
				problems.push("isInstalled is false but game has " + gameInstallations.length + " gameInstallations");
			}
		}

		//
		// Check Game Modes
		//

		if (strictMode)
		{
			const gameModes = await prismaClient.gameMode.findMany(
				{
					where:
					{
						game_id: game.id,
					},
				});

			if (gameModes.length == 0)
			{
				problems.push("no gameModes");
			}
		}

		//
		// Check Game Platforms
		//

		if (strictMode)
		{
			const gamePlatforms = await prismaClient.gamePlatform.findMany(
				{
					where:
					{
						game_id: game.id,
					},
				});

			if (gamePlatforms.length == 0)
			{
				problems.push("no gamePlatforms");
			}
		}

		//
		// Check Game Play Actions
		//

		const gamePlayActions = await prismaClient.gamePlayAction.findMany(
			{
				where:
				{
					game_id: game.id,
				},
			});

		if (gamePlayActions.length == 0)
		{
			problems.push("no gamePlayActions");
		}

		//
		// Check Game Play Sessions
		//

		const gamePlaySessions = await prismaClient.gamePlaySession.findMany(
			{
				where:
				{
					game_id: game.id,
				},
			});

		let playTimeTotalSeconds = 0;

		for (const gamePlaySession of gamePlaySessions)
		{
			playTimeTotalSeconds += gamePlaySession.playTimeSeconds;
		}

		if (game.playTimeTotalSeconds != playTimeTotalSeconds)
		{
			const difference = game.playTimeTotalSeconds - playTimeTotalSeconds;

			problems.push("playTimeTotalSeconds differs from gamePlaySessions total: " + difference);
		}

		//
		// Check Game Publishers
		//

		if (strictMode)
		{
			const gamePublishers = await prismaClient.gamePublisher.findMany(
				{
					where:
					{
						game_id: game.id,
					},
				});

			if (gamePublishers.length == 0)
			{
				problems.push("no gamePublishers");
			}
		}

		//
		// Log Problems
		//

		if (problems.length == 0)
		{
			continue;
		}

		console.group("game #" + game.id + ": " + game.name + " (Steam app ID: " + game.steamAppId + ")");

		for (const problem of problems)
		{
			console.log(problem);
		}

		console.groupEnd();
	}

	await CliLib.pause(readlineInterface);
}

//
// Actions Record
//

type Action =
{
	description: string;
	execute: (readlineInterface: readline.promises.Interface) => Promise<void>;
};

const actions: Record<string, Action> =
{
	addEngine:
	{
		description: "Add a new engine to your library",
		execute: async (readlineInterface) => addEngine(readlineInterface),
	},

	addGame:
	{
		description: "Add a new game to your library",
		execute: async (readlineInterface) => addGame(readlineInterface),
	},
	downloadGameImagesFromSteam:
	{
		description: "Download images for a game from Steam",
		execute: async (readlineInterface) => downloadGameImagesFromSteam(readlineInterface),
	},

	addGameEngine:
	{
		description: "Add an engine to an existing game",
		execute: async (readlineInterface) => addGameEngine(readlineInterface),
	},
	addGameInstallation:
	{
		description: "Add a new game installation to an existing game",
		execute: async (readlineInterface) => addGameInstallation(readlineInterface),
	},

	addGamePlaySession:
	{
		description: "Add a historical game play session to an existing game",
		execute: async (readlineInterface) => addGamePlaySession(readlineInterface),
	},

	addSeriesGame:
	{
		description: "Add a game to a series",
		execute: async (readlineInterface) => addSeriesGame(readlineInterface),
	},

	audit:
	{
		description: "Audit your game library for potential issues",
		execute: async (readlineInterface) => audit(readlineInterface),
	},
};

//
// CLI
//

async function main()
{
	const readlineInterface = readline.promises.createInterface(
		{
			input: process.stdin,
			output: process.stdout
		});
	
	loop: while (true)
	{
		console.clear();
	
		const action = await CliLib.prompt(readlineInterface,
			{
				text: "Choose an action",
				options:
				[
					...Object.entries(actions).map(
						([ actionName, action ]) =>
						{
							return {
								value: actionName,
								description: action.description,
							};
						}),

					{
						value: "exit",
						description: "Exit the CLI",
					},
				],
				validateAndTransform: async (input) =>
				{
					if (input == "exit")
					{
						return null;
					}

					const action = actions[input];

					if (action == null)
					{
						throw new CliLib.RetryableError("Invalid action: " + input);
					}

					return action;
				},
			});
	
		if (action == null)
		{
			break loop;
		}

		await action.execute(readlineInterface);
	}
	
	readlineInterface.close();

	await prismaClient.$disconnect();
}

await main();