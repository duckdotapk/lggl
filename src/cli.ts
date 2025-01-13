//
// Imports
//

import readline from "node:readline";

import { Prisma } from "@prisma/client";
import chalk from "chalk";
import { DateTime } from "luxon";
import { z } from "zod";

import { LGGL_PLATFORM_ID_LINUX } from "./env/LGGL_PLATFORM_ID_LINUX.js";
import { LGGL_PLATFORM_ID_MAC } from "./env/LGGL_PLATFORM_ID_MAC.js";
import { LGGL_PLATFORM_ID_STEAM_DECK } from "./env/LGGL_PLATFORM_ID_STEAM_DECK.js";
import { LGGL_PLATFORM_ID_UNKNOWN } from "./env/LGGL_PLATFORM_ID_UNKNOWN.js";
import { LGGL_PLATFORM_ID_WINDOWS } from "./env/LGGL_PLATFORM_ID_WINDOWS.js";
import { LGGL_STEAM_API_KEY } from "./env/LGGL_STEAM_API_KEY.js";
import { LGGL_STEAM_USER_ID } from "./env/LGGL_STEAM_USER_ID.js"

import { prismaClient } from "./instances/prismaClient.js";

import * as GameCliLib from "./libs/cli/Game.js";
import * as GameInstallationCliLib from "./libs/cli/GameInstallation.js";
import * as GamePlatformCliLib from "./libs/cli/GamePlatform.js";
import * as GamePlayActionCliLib from "./libs/cli/GamePlayAction.js";
import * as GamePlaySessionCliLib from "./libs/cli/GamePlaySession.js";
import * as PlatformCliLib from "./libs/cli/Platform.js";
import * as SeriesCliLib from "./libs/cli/Series.js";
import * as SeriesGameCliLib from "./libs/cli/SeriesGame.js";

import * as SteamThirdPartyLib from "./libs/third-party/Steam.js";

import * as CliLib from "./libs/Cli.js";

//
// Game Actions
//

async function createGame(readlineInterface: readline.promises.Interface)
{
	//
	// Get Steam Data
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

				return z.coerce.number().min(1).parse(input);
			},
		});

	//
	// Create Game
	//

	const gameCreateOptions: GameCliLib.CreateOptions = {};

	if (steamAppId != null)
	{
		gameCreateOptions.steamAppDetails = await SteamThirdPartyLib.fetchAppDetails(steamAppId);

		const ownedGames = await SteamThirdPartyLib.fetchOwnedGames(LGGL_STEAM_API_KEY, LGGL_STEAM_USER_ID);

		gameCreateOptions.steamOwnedGame = ownedGames.games.find((game) => game.appid == steamAppId) ?? null;
	}

	const game = await GameCliLib.create(readlineInterface, gameCreateOptions);

	console.log(chalk.green("Created %s! (Game ID: %d)"), game.name, game.id);

	//
	// Automatically Download Game Images
	//

	const numberOfImagesDownloadedFromSteam = await GameCliLib.downloadImagesFromSteam(readlineInterface, game);
	
	console.log(chalk.green("Downloaded %d images from Steam for %s!", game.name), numberOfImagesDownloadedFromSteam);

	//
	// Automatically Create Game Platforms (if steamAppDetails is available)
	//

	if (gameCreateOptions.steamAppDetails?.platforms.windows)
	{
		const platform = await prismaClient.platform.findFirstOrThrow(
			{
				where:
				{
					id: LGGL_PLATFORM_ID_WINDOWS,
				},
			});

		const gamePlatform = await GamePlatformCliLib.create(
			{
				game,
				platform,
			});

		console.log("Added %s as a platform for %s! (Game Platform #%s)", platform.name, game.name, gamePlatform.id);
	}

	if (gameCreateOptions.steamAppDetails?.platforms.mac)
	{
		const platform = await prismaClient.platform.findFirstOrThrow(
			{
				where:
				{
					id: LGGL_PLATFORM_ID_MAC,
				},
			});

		const gamePlatform = await GamePlatformCliLib.create(
			{
				game,
				platform,
			});

		console.log("Added %s as a platform for %s! (Game Platform #%s)", platform.name, game.name, gamePlatform.id);
	}

	if (gameCreateOptions.steamAppDetails?.platforms.linux)
	{
		const platform = await prismaClient.platform.findFirstOrThrow(
			{
				where:
				{
					id: LGGL_PLATFORM_ID_LINUX,
				},
			});

		const gamePlatform = await GamePlatformCliLib.create(
			{
				game,
				platform,
			});

		console.log("Added %s as a platform for %s! (Game Platform #%s)", platform.name, game.name, gamePlatform.id);
	}

	//
	// Automatically Create Game Play Sessions (if steamOwnedGame is available)
	//

	if (game.steamAppId != null)
	{
		const clientLastPlayedTimes = await SteamThirdPartyLib.fetchClientLastPlayedTimes(LGGL_STEAM_API_KEY);

		const steamPlayedGame = await clientLastPlayedTimes.games.find((steamPlayedGame) => steamPlayedGame.appid == game.steamAppId);

		if (steamPlayedGame != null)
		{
			const firstPlayedTimestamp = steamPlayedGame.first_playtime;
			const lastPlayedTimestamp = steamPlayedGame.last_playtime;

			const windowsPlayTimeSeconds = steamPlayedGame.playtime_windows_forever * 60;
			const macPlayTimeSeconds = steamPlayedGame.playtime_mac_forever * 60;
			const linuxPlayTimeSeconds = (steamPlayedGame.playtime_linux_forever - steamPlayedGame.playtime_deck_forever) * 60;
			const steamDeckPlayTimeSeconds = steamPlayedGame.playtime_deck_forever * 60;
			const unknownPlayTimeSeconds =
			(
				(
					steamPlayedGame.playtime_forever -
					steamPlayedGame.playtime_windows_forever -
					steamPlayedGame.playtime_mac_forever -
					steamPlayedGame.playtime_linux_forever
				) +
				steamPlayedGame.playtime_disconnected
			) * 60;

			await prismaClient.game.update(
				{
					where:
					{
						id: game.id,
					},
					data:
					{
						firstPlayedDate: DateTime.fromSeconds(firstPlayedTimestamp).toJSDate(),
						firstPlayedDateApproximated: false,
						lastPlayedDate: DateTime.fromSeconds(lastPlayedTimestamp).toJSDate(),
						playCount: 1,
						playTimeTotalSeconds: 
							windowsPlayTimeSeconds + 
							macPlayTimeSeconds + 
							linuxPlayTimeSeconds + 
							steamDeckPlayTimeSeconds + 
							unknownPlayTimeSeconds,
					},
				});

			if (windowsPlayTimeSeconds > 0)
			{
				await prismaClient.gamePlaySession.create(
					{
						data:
						{
							startDate: DateTime.fromSeconds(0).toJSDate(),
							endDate: DateTime.fromSeconds(windowsPlayTimeSeconds).toJSDate(),
							playTimeSeconds: windowsPlayTimeSeconds,
							addedToTotal: true,
							isHistorical: true,
							notes: "Historical playtime from Steam.",

							game_id: game.id,
							platform_id: LGGL_PLATFORM_ID_WINDOWS,
						},
					});
			}

			if (macPlayTimeSeconds > 0)
			{
				await prismaClient.gamePlaySession.create(
					{
						data:
						{
							startDate: DateTime.fromSeconds(0).toJSDate(),
							endDate: DateTime.fromSeconds(macPlayTimeSeconds).toJSDate(),
							playTimeSeconds: macPlayTimeSeconds,
							addedToTotal: true,
							isHistorical: true,
							notes: "Historical playtime from Steam.",

							game_id: game.id,
							platform_id: LGGL_PLATFORM_ID_MAC,
						},
					});
			}

			if (linuxPlayTimeSeconds > 0)
			{
				await prismaClient.gamePlaySession.create(
					{
						data:
						{
							startDate: DateTime.fromSeconds(0).toJSDate(),
							endDate: DateTime.fromSeconds(linuxPlayTimeSeconds).toJSDate(),
							playTimeSeconds: linuxPlayTimeSeconds,
							addedToTotal: true,
							isHistorical: true,
							notes: "Historical playtime from Steam.",

							game_id: game.id,
							platform_id: LGGL_PLATFORM_ID_LINUX,
						},
					});
			}

			if (steamDeckPlayTimeSeconds > 0)
			{
				await prismaClient.gamePlaySession.create(
					{
						data:
						{
							startDate: DateTime.fromSeconds(0).toJSDate(),
							endDate: DateTime.fromSeconds(steamDeckPlayTimeSeconds).toJSDate(),
							playTimeSeconds: steamDeckPlayTimeSeconds,
							addedToTotal: true,
							isHistorical: true,
							notes: "Historical playtime from Steam.",

							game_id: game.id,
							platform_id: LGGL_PLATFORM_ID_STEAM_DECK,
						},
					});
			}

			if (unknownPlayTimeSeconds > 0)
			{
				await prismaClient.gamePlaySession.create(
					{
						data:
						{
							startDate: DateTime.fromSeconds(0).toJSDate(),
							endDate: DateTime.fromSeconds(unknownPlayTimeSeconds).toJSDate(),
							playTimeSeconds: unknownPlayTimeSeconds,
							addedToTotal: true,
							isHistorical: true,
							notes: "Historical playtime from Steam.",

							game_id: game.id,
							platform_id: LGGL_PLATFORM_ID_UNKNOWN,
						}
					});
			}
		}
	}

	//
	// Add Other Related Data
	//

	await addGamePlatforms(readlineInterface, game);

	await addGameInstallations(readlineInterface, game);

	await addGamePlayActions(readlineInterface, game);

	await addGamePlaySessions(readlineInterface, game);

	//
	// Add Series
	//

	const isPartOfSeries = await CliLib.confirm(readlineInterface,
		{
			text: "Is this game part of a series?",
			defaultValue: false,
		});

	if (isPartOfSeries)
	{
		const series = await SeriesCliLib.searchAndChooseOne(readlineInterface);

		const seriesGame = await SeriesGameCliLib.create(readlineInterface,
			{
				series,
				game,
			});

		console.log(chalk.green("Added %s to %s! (Series Game #%d)"), game.name, series.name, seriesGame.id);
	}
}

// TODO: addGameGenres

async function addGameInstallations(readlineInterface: readline.promises.Interface, game: Prisma.GameGetPayload<null>)
{
	loop: while (true)
	{
		const gameInstallations = await prismaClient.gameInstallation.findMany(
			{
				where:
				{
					game_id: game.id,
				},
			});

		console.group("Game installations for " + game.name + " (Game ID: " + game.id + "):");

		for (const gameInstallation of gameInstallations)
		{
			console.log("%s (ID: %d)", 
				gameInstallation.path, 
				gameInstallation.id);
		}

		console.groupEnd();

		const OptionSchema = z.enum([ "createNew", "done" ]);

		type Option = z.infer<typeof OptionSchema>;

		const option = await CliLib.prompt(readlineInterface,
			{
				text: "Add an installation for this game",
				options:
				[
					{
						value: "createNew" satisfies Option,
						description: "Create a new installation",
					},
					{
						value: "done" satisfies Option,
						description: "Finish adding installations",
					},
				],
				validateAndTransform: async (input) => OptionSchema.parse(input),
			});

		switch (option)
		{
			case "createNew":
			{
				break;
			}

			case "done":
			{		
				break loop;
			}
		}
		
		const gameInstallation = await GameInstallationCliLib.create(readlineInterface,
			{
				game,
			});

		console.log(chalk.green("Created game installation #%d!"), gameInstallation.id);
	}

	const gameInstallations = await prismaClient.gameInstallation.findMany(
		{
			where:
			{
				game_id: game.id,
			},
		});

	if (gameInstallations.length > 0)
	{
		await prismaClient.game.update(
			{
				where:
				{
					id: game.id,
				},
				data:
				{
					isInstalled: true,
				},
			});
	}
}

// TODO: addGameLinks

// TODO: addGameModes

async function addGamePlatforms(readlineInterface: readline.promises.Interface, game: Prisma.GameGetPayload<null>)
{
	loop: while (true)
	{
		const gamePlatforms = await prismaClient.gamePlatform.findMany(
			{
				where:
				{
					game_id: game.id,
				},
				include:
				{
					platform: true,
				},
			});

		console.group("Game platforms for " + game.name + " (Game ID: " + game.id + "):");

		for (const gamePlatform of gamePlatforms)
		{
			console.log("%s (ID: %d) (Platform ID: %d)", 
				gamePlatform.platform.name, 
				gamePlatform.id,
				gamePlatform.platform.id);
		}

		console.groupEnd();

		const OptionSchema = z.enum([ "createNew", "addExisting", "done" ]);

		type Option = z.infer<typeof OptionSchema>;

		const option = await CliLib.prompt(readlineInterface,
			{
				text: "Add a platform to this game",
				options:
				[
					{
						value: "createNew" satisfies Option,
						description: "Create a new platform",
					},
					{
						value: "addExisting" satisfies Option,
						description: "Use an existing platform",
					},
					{
						value: "done" satisfies Option,
						description: "Finish adding platforms",
					},
				],
				validateAndTransform: async (input) => OptionSchema.parse(input),
			});

		let platform: Prisma.PlatformGetPayload<null>;

		switch (option)
		{
			case "createNew":
			{
				platform = await PlatformCliLib.create(readlineInterface);

				break;
			}

			case "addExisting":
			{
				const platforms = await PlatformCliLib.search(readlineInterface);

				if (platforms.length == 0)
				{
					console.log("No platforms found. Please try again or create a new platform.");

					continue loop;
				}
				else if (platforms.length == 1)
				{
					platform = platforms[0]!;
				}
				else
				{
					platform = await PlatformCliLib.choose(readlineInterface, platforms);
				}

				break;
			}

			case "done":
			{		
				break loop;
			}
		}

		const gamePlatform = await prismaClient.gamePlatform.create(
			{
				data:
				{			
					game_id: game.id,
					platform_id: platform.id,
				},
			});

		console.log("Added %s as a platform for %s! (Game Platform #%s)", platform.name, game.name, gamePlatform.id);
	}
}

async function addGamePlayActions(readlineInterface: readline.promises.Interface, game: Prisma.GameGetPayload<null>)
{
	loop: while (true)
	{
		const gamePlayActions = await prismaClient.gamePlayAction.findMany(
			{
				where:
				{
					game_id: game.id,
				},
			});

		console.group("Game play actions for " + game.name + " (Game ID: " + game.id + "):");

		for (const gamePlayAction of gamePlayActions)
		{
			console.log("%s (ID: %d) (Path: %s)", 
				gamePlayAction.name, 
				gamePlayAction.id,
				gamePlayAction.trackingPath);
		}

		console.groupEnd();

		const OptionSchema = z.enum([ "createNew", "done" ]);

		type Option = z.infer<typeof OptionSchema>;

		const option = await CliLib.prompt(readlineInterface,
			{
				text: "Add a play action to this game",
				options:
				[
					{
						value: "createNew" satisfies Option,
						description: "Create a new play action",
					},
					{
						value: "done" satisfies Option,
						description: "Finish adding play actions",
					},
				],
				validateAndTransform: async (input) => OptionSchema.parse(input),
			});

		switch (option)
		{
			case "createNew":
			{
				break;
			}

			case "done":
			{		
				break loop;
			}
		}

		const gamePlayAction = await GamePlayActionCliLib.create(readlineInterface,
			{
				game,
			});

		console.log(chalk.green("Created game play action #%d!"), gamePlayAction.id);
	}
}

async function addGamePlaySessions(readlineInterface: readline.promises.Interface, game: Prisma.GameGetPayload<null>)
{
	loop: while (true)
	{
		const OptionSchema = z.enum([ "createNew", "done" ]);

		type Option = z.infer<typeof OptionSchema>;

		const option = await CliLib.prompt(readlineInterface,
			{
				text: "Add a play session for this game",
				options:
				[
					{
						value: "createNew" satisfies Option,
						description: "Create a new play session",
					},
					{
						value: "done" satisfies Option,
						description: "Finish adding play sessions",
					},
				],
				validateAndTransform: async (input) => OptionSchema.parse(input),
			});

		let platform: Prisma.PlatformGetPayload<null>;

		switch (option)
		{
			case "createNew":
			{
				const platforms = await PlatformCliLib.search(readlineInterface);

				if (platforms.length == 0)
				{
					console.log("No platforms found. Please try again or create a new platform.");

					continue loop;
				}

				platform = await PlatformCliLib.choose(readlineInterface, platforms);

				break;
			}

			case "done":
			{		
				break loop;
			}
		}
		
		const gamePlaySession = await GamePlaySessionCliLib.create(readlineInterface,
			{
				game,
				platform,
			});

		console.log(chalk.green("Created game play session #%d!"), gamePlaySession.id);
	}
}

//
// Platform Actions
//

async function createPlatform(readlineInterface: readline.promises.Interface)
{
	const platform = await PlatformCliLib.create(readlineInterface);

	console.log(chalk.green("Created %s! (Platform ID: %d)"), platform.name, platform.id);
}

//
// Series Actions
//

async function createSeries(readlineInterface: readline.promises.Interface)
{
	const series = await SeriesCliLib.create(readlineInterface);

	console.log(chalk.green("Created %s! (Series ID: %d)"), series.name, series.id);
}

async function addSeriesGames(readlineInterface: readline.promises.Interface, series: Prisma.SeriesGetPayload<null>)
{
	loop: while (true)
	{
		const OptionSchema = z.enum([ "addExisting", "done" ]);

		type Option = z.infer<typeof OptionSchema>;

		const option = await CliLib.prompt(readlineInterface,
			{
				text: "Add a game to this series",
				options:
				[
					{
						value: "addExisting" satisfies Option,
						description: "Use an existing game",
					},
					{
						value: "done" satisfies Option,
						description: "Finish adding games",
					},
				],
				validateAndTransform: async (input) => OptionSchema.parse(input),
			});

		let game: Prisma.GameGetPayload<null>;

		switch (option)
		{
			case "addExisting":
			{
				const games = await GameCliLib.search(readlineInterface);

				if (games.length == 0)
				{
					console.log("No games found. Please try again.");

					continue loop;
				}

				game = await GameCliLib.choose(readlineInterface, games);

				break;
			}

			case "done":
			{		
				break loop;
			}
		}

		const seriesGame = await SeriesGameCliLib.create(readlineInterface,
			{
				series,
				game,
			});

		console.log(chalk.green("Added %s to %s! (Series Game #%d)"), game.name, series.name, seriesGame.id);
	}
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
	createGame:
	{
		description: "Add a new game to your library",
		execute: createGame,
	},
	addGameInstallations:
	{
		description: "Add installations to an existing game",
		execute: async (readlineInterface) =>
		{
			const game = await GameCliLib.searchAndChooseOne(readlineInterface);

			await addGameInstallations(readlineInterface, game);
		},
	},
	addGamePlatforms:
	{
		description: "Add platforms to an existing game",
		execute: async (readlineInterface) =>
		{
			const game = await GameCliLib.searchAndChooseOne(readlineInterface);

			await addGamePlatforms(readlineInterface, game);
		},
	},
	addGamePlayActions:
	{
		description: "Add play actions to an existing game",
		execute: async (readlineInterface) =>
		{
			const game = await GameCliLib.searchAndChooseOne(readlineInterface);

			await addGamePlayActions(readlineInterface, game);
		},
	},
	addGamePlaySessions:
	{
		description: "Add play sessions to an existing game",
		execute: async (readlineInterface) =>
		{
			const game = await GameCliLib.searchAndChooseOne(readlineInterface);

			await addGamePlaySessions(readlineInterface, game);
		},
	},

	createPlatform:
	{
		description: "Add a new platform to your library",
		execute: createPlatform,
	},

	createSeries:
	{
		description: "Add a new series to your library",
		execute: createSeries,
	},
	addSeriesGames:
	{
		description: "Add games to an existing series",
		execute: async (readlineInterface) =>
		{
			const series = await SeriesCliLib.searchAndChooseOne(readlineInterface);

			await addSeriesGames(readlineInterface, series);
		},
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