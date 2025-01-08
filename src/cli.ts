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

import * as CompanyCliLib from "./libs/cli/Company.js";
import * as EngineCliLib from "./libs/cli/Engine.js";
import * as GameCliLib from "./libs/cli/Game.js";
import * as GameCompanyCliLib from "./libs/cli/GameCompany.js";
import * as GameEngineCliLib from "./libs/cli/GameEngine.js";
import * as GameInstallationCliLib from "./libs/cli/GameInstallation.js";
import * as GamePlatformCliLib from "./libs/cli/GamePlatform.js";
import * as GamePlayActionCliLib from "./libs/cli/GamePlayAction.js";
import * as GamePlaySessionCliLib from "./libs/cli/GamePlaySession.js";
import * as PlatformCliLib from "./libs/cli/Platform.js";
import * as SeriesCliLib from "./libs/cli/Series.js";
import * as SeriesGameCliLib from "./libs/cli/SeriesGame.js";

import * as SteamThirdPartyLib from "./libs/third-party/Steam.js";

import * as AuditLib from "./libs/Audit.js";
import * as CliLib from "./libs/Cli.js";

//
// General Actions
//

async function audit(readlineInterface: readline.promises.Interface)
{
	const autoFixProblems = await CliLib.confirm(readlineInterface,
		{
			text: "Automatically fix problems where possible?",
			defaultValue: false,
		});

	const games = await prismaClient.game.findMany(
		{
			include:
			{
				gameCompanies: true,
				gameEngines: true,
				gameGenres: true,
				gameInstallations: true,
				gameLinks: true,
				gameModes: true,
				gamePlatforms: true,
				gamePlayActions: true,
				gamePlaySessions: true,
				seriesGames: true,
			},
			orderBy:
			{
				id: "asc",
			},
		});

	const problemLists: AuditLib.ProblemList[] = [];

	for (const game of games)
	{
		const problemList = await AuditLib.auditGame(game, autoFixProblems);

		if (problemList.problems.length == 0)
		{
			continue;
		}

		problemLists.push(problemList);
	}

	let totalProblems = 0;
	let totalAutoFixableProblems = 0;

	for (const problemList of problemLists)
	{
		console.group(problemList.game.name + " (Game ID: " + problemList.game.id + ")");

		for (const problem of problemList.problems)
		{
			if (autoFixProblems && problem.isAutoFixable)
			{
				if (problem.wasAutomaticallyFixed)
				{
					console.log(chalk.green("%s (Auto-fixed)"), problem.description);
				}
				else
				{
					console.log(chalk.red("%s (Was not auto-fixed)"), problem.description);
				}
			}
			else
			{
				console.log("%s", problem.description);
			}
		}

		console.groupEnd();

		totalProblems += problemList.problems.length;
		totalAutoFixableProblems += problemList.problems.filter((problem) => problem.isAutoFixable).length;
	}

	console.log(chalk.bold("Total problems: %d"), totalProblems);
	console.log(chalk.bold("Total auto-fixable problems: %d"), totalAutoFixableProblems);
}

//
// Company Actions
//

async function createCompany(readlineInterface: readline.promises.Interface)
{
	const company = await CompanyCliLib.create(readlineInterface);

	console.log(chalk.green("Created %s! (Company ID: %d)"), company.name, company.id);
}

//
// Engine Actions
//

async function createEngine(readlineInterface: readline.promises.Interface)
{
	const engine = await EngineCliLib.create(readlineInterface);

	console.log(chalk.green("Engine #%d created!"), engine.id);
}

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

	await addGameCompanies(readlineInterface, game);

	await addGameEngines(readlineInterface, game);

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

async function addGameCompanies(readlineInterface: readline.promises.Interface, game: Prisma.GameGetPayload<null>)
{
	loop: while (true)
	{
		const gameCompanies = await prismaClient.gameCompany.findMany(
			{
				where:
				{
					game_id: game.id,
				},
				include:
				{
					company: true,
				},
			});

		console.group("Game companies for " + game.name + " (Game ID: " + game.id + "):");

		for (const gameCompany of gameCompanies)
		{
			console.log("%s (ID: %d) (Type: %s) (Notes: %s) (Company ID: %d)", 
				gameCompany.company.name,
				gameCompany.id,
				gameCompany.type,
				gameCompany.notes, 
				gameCompany.company.id);
		}

		console.groupEnd();

		const OptionSchema = z.enum([ "createNew", "addExisting", "done" ]);

		type Option = z.infer<typeof OptionSchema>;

		const option = await CliLib.prompt(readlineInterface,
			{
				text: "Add a company to this " + game.name + " (Game ID: " + game.id + ")",
				options:
				[
					{
						value: "createNew" satisfies Option,
						description: "Create a new company",
					},
					{
						value: "addExisting" satisfies Option,
						description: "Use an existing company",
					},
					{
						value: "done" satisfies Option,
						description: "Finish adding companies",
					},
				],
				validateAndTransform: async (input) => OptionSchema.parse(input),
			});

		let company: Prisma.CompanyGetPayload<null>;

		switch (option)
		{
			case "createNew":
			{
				company = await CompanyCliLib.create(readlineInterface);

				break;
			}

			case "addExisting":
			{
				const companies = await CompanyCliLib.search(readlineInterface);

				if (companies.length == 0)
				{
					console.log("No companies found. Please try again or create a new company.");

					continue loop;
				}

				company = await CompanyCliLib.choose(readlineInterface, companies);

				break;
			}

			case "done":
			{		
				break loop;
			}
		}
		
		const existingGameCompany = await prismaClient.gameCompany.findFirst(
			{
				where:
				{
					game_id: game.id,
					company_id: company.id,
				},
			});

		if (existingGameCompany != null)
		{
			console.log("Company %s is already associated with %s! (Game Company #%s)", company.name, game.name, existingGameCompany.id);

			continue loop;
		}

		const gameCompany = await GameCompanyCliLib.create(readlineInterface,
			{
				game,
				company,
			});
	
		console.log(chalk.green("Added %s as a %s for %s! (Game Company #%s)"), company.name, gameCompany.type, game.name, gameCompany.id);
	}
}

async function addGameEngines(readlineInterface: readline.promises.Interface, game: Prisma.GameGetPayload<null>)
{
	loop: while (true)
	{
		const gameEngines = await prismaClient.gameEngine.findMany(
			{
				where:
				{
					game_id: game.id,
				},
				include:
				{
					engine: true,
				},
			});

		console.group("Game engines for " + game.name + " (Game ID: " + game.id + "):");

		for (const gameEngine of gameEngines)
		{
			console.log("%s (ID: %d) (Notes: %s) (Engine ID: %d)", 
				gameEngine.engine.name, 
				gameEngine.id, 
				gameEngine.notes, 
				gameEngine.engine.id);
		}

		console.groupEnd();

		const OptionSchema = z.enum([ "createNew", "addExisting", "done" ]);

		type Option = z.infer<typeof OptionSchema>;

		const option = await CliLib.prompt(readlineInterface,
			{
				text: "Add an engine to this game",
				options:
				[
					{
						value: "createNew" satisfies Option,
						description: "Create a new engine",
					},
					{
						value: "addExisting" satisfies Option,
						description: "Use an existing engine",
					},
					{
						value: "done" satisfies Option,
						description: "Finish adding engines",
					},
				],
				validateAndTransform: async (input) => OptionSchema.parse(input),
			});

		let engine: Prisma.EngineGetPayload<null>;

		switch (option)
		{
			case "createNew":
			{
				engine = await EngineCliLib.create(readlineInterface);

				break;
			}

			case "addExisting":
			{
				const engines = await EngineCliLib.search(readlineInterface);

				if (engines.length == 0)
				{
					console.log("No engines found. Please try again or create a new engine.");

					continue loop;
				}

				engine = await EngineCliLib.choose(readlineInterface, engines);

				break;
			}

			case "done":
			{		
				break loop;
			}
		}

		
		const existingGameEngine = await prismaClient.gameEngine.findFirst(
			{
				where:
				{
					game_id: game.id,
					engine_id: engine.id,
				},
			});

		if (existingGameEngine != null)
		{
			console.log("Engine %s is already associated with %s! (Game Engine #%s)", engine.name, game.name, existingGameEngine.id);

			continue loop;
		}

		const gameEngine = await GameEngineCliLib.create(readlineInterface,
			{
				game,
				engine,
			});
	
		console.log("Added %s as an engine for %s! (Game Engine #%s)", engine.name, game.name, gameEngine.id);
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

				platform = await PlatformCliLib.choose(readlineInterface, platforms);

				break;
			}

			case "done":
			{		
				break loop;
			}
		}

		const existingGamePlatform = gamePlatforms.find((gamePlatform) => gamePlatform.platform_id == platform.id);

		if (existingGamePlatform != null)
		{
			console.log("Platform %s is already associated with %s! (Game Platform #%s)", platform.name, game.name, existingGamePlatform.id);

			continue loop;
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
// Genre Actions
//

// TODO: createGenre

//
// Mode Actions
//

// TODO: createMode

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
// Steam Actions
//

async function downloadGameImagesFromSteam(readlineInterface: readline.promises.Interface, game: Prisma.GameGetPayload<null>)
{
	const numberOfImagesDownloadedFromSteam = await GameCliLib.downloadImagesFromSteam(readlineInterface, game);

	console.log(chalk.green("%d images downloaded from Steam!"), numberOfImagesDownloadedFromSteam);
}

async function pullMissingDescriptionsFromSteam(readlineInterface: readline.promises.Interface)
{
	const games = await prismaClient.game.findMany(
		{
			where:
			{
				description: null,

				steamAppId: { not: null },
			},
		});

	for (const [ gameIndex, game ] of games.entries())
	{
		//
		// Clear Console
		//

		console.clear();

		console.log("%d left...", games.length - gameIndex);

		//
		// Fetch Steam App Details
		//

		const steamAppDetails = await SteamThirdPartyLib.fetchAppDetails(game.steamAppId!);

		if (steamAppDetails == null)
		{
			console.log(chalk.red("Failed to fetch Steam app details for %s!"), game.name);

			continue;
		}

		//
		// Log Description
		//

		const lines = await steamAppDetails.short_description.split("\n");

		console.group("%s description:", game.name);

		for (const line of lines)
		{
			console.log(line);
		}

		console.groupEnd();

		//
		// Prompt to Use Description
		//

		console.log("");

		const description = await CliLib.prompt(readlineInterface,
			{
				text: "Description:",
				defaultValue: steamAppDetails.short_description.trim(),
				validateAndTransform: async (input) => z.string().nonempty().parse(input),
			});

		//
		// Update Game
		//

		await prismaClient.game.update(
			{
				where:
				{
					id: game.id,
				},
				data:
				{
					description,
				},
			});
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
	audit:
	{
		description: "Audit your game library for weird or missing data",
		execute: audit,
	},

	createCompany:
	{
		description: "Add a new company to your library",
		execute: createCompany,
	},

	createEngine:
	{
		description: "Add a new engine to your library",
		execute: createEngine,
	},

	createGame:
	{
		description: "Add a new game to your library",
		execute: createGame,
	},
	addGameCompanies:
	{
		description: "Add companies to an existing game",
		execute: async (readlineInterface) =>
		{
			const game = await GameCliLib.searchAndChooseOne(readlineInterface);

			await addGameCompanies(readlineInterface, game);
		},
	},
	addGameEngines:
	{
		description: "Add engine to an existing game",
		execute: async (readlineInterface) =>
		{
			const game = await GameCliLib.searchAndChooseOne(readlineInterface);

			await addGameEngines(readlineInterface, game);
		},
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

	downloadGameImagesFromSteam:
	{
		description: "Download images for a game from Steam",
		execute: async (readlineInterface) =>
		{
			const game = await GameCliLib.searchAndChooseOne(readlineInterface);

			await downloadGameImagesFromSteam(readlineInterface, game);
		},
	},
	pullMissingDescriptionsFromSteam:
	{
		description: "Pull missing descriptions from Steam",
		execute: pullMissingDescriptionsFromSteam,
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