//
// Imports
//

import fs from "node:fs";
import readline from "node:readline";

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";
import { z } from "zod";

import { LGGL_PLATFORM_ID_LINUX } from "../../env/LGGL_PLATFORM_ID_LINUX.js";
import { LGGL_PLATFORM_ID_MAC } from "../../env/LGGL_PLATFORM_ID_MAC.js";
import { LGGL_PLATFORM_ID_WINDOWS } from "../../env/LGGL_PLATFORM_ID_WINDOWS.js";
import { LGGL_STEAM_API_KEY } from "../../env/LGGL_STEAM_API_KEY.js";
import { LGGL_STEAM_USER_ID } from "../../env/LGGL_STEAM_USER_ID.js";

import { prismaClient } from "../../instances/prismaClient.js";

import * as GameSchemaLib from "../schemas/Game.js";
import * as GamePlayActionSchemaLib from "../schemas/GamePlayAction.js";

import * as SteamThirdPartyLib from "../third-party/Steam.js";

import * as CliLib from "../Cli.js";
import * as FileSizeLib from "../FileSize.js";
import * as NetworkLib from "../Network.js";

//
// Utility Functions
//

// TODO: this function is responsible for TOO MUCH! break it up!!
export async function create(readlineInterface: readline.promises.Interface)
{
	//
	// Get Steam App ID
	//

	const steamAppId = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the game's steam app ID or store page URL (optional)",
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

	// TODO: parse release date from appDetails as a default value
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

	return await prismaClient.$transaction(
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
							hasBannerImage: await NetworkLib.downloadUrl(imageUrls.libraryBackground, [ "images", "games", game.id.toString(), "banner.jpg" ]),
							hasCoverImage: await NetworkLib.downloadUrl(imageUrls.libraryCapsule, [ "images", "games", game.id.toString(), "cover.jpg" ]),
							hasIconImage: imageUrls.icon != null 
								? await NetworkLib.downloadUrl(imageUrls.icon, [ "images", "games", game.id.toString(), "icon.jpg" ])
								: false,
							hasLogoImage: await NetworkLib.downloadUrl(imageUrls.libraryLogo, [ "images", "games", game.id.toString(), "logo.png" ]),
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

			//
			// Return
			//

			return game;
		});
}

export async function search(readlineInterface: readline.promises.Interface)
{
	return await CliLib.prompt(readlineInterface,
		{
			text: "Search for a game",
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
							sortName: "asc",
						},
					});

				if (games.length == 0)
				{
					throw new CliLib.RetryableError("No games found.");
				}

				return games;
			},
		});
}

export async function choose(readlineInterface: readline.promises.Interface, games: Prisma.GameGetPayload<null>[])
{
	return await CliLib.prompt(readlineInterface,
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
}