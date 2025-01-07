//
// Imports
//

import fs from "node:fs";
import readline from "node:readline";

import { Prisma } from "@prisma/client";
import chalk from "chalk";
import { z } from "zod";

import { LGGL_PLATFORM_ID_LINUX } from "./env/LGGL_PLATFORM_ID_LINUX.js";
import { LGGL_PLATFORM_ID_MAC } from "./env/LGGL_PLATFORM_ID_MAC.js";
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
import * as GamePlaySessionCliLib from "./libs/cli/GamePlaySession.js";
import * as PlatformCliLib from "./libs/cli/Platform.js";
import * as SeriesCliLib from "./libs/cli/Series.js";
import * as SeriesGameCliLib from "./libs/cli/SeriesGame.js";

import * as GameModelLib from "./libs/models/Game.js";

import * as GameCompanySchemaLib from "./libs/schemas/GameCompany.js";

import * as SteamThirdPartyLib from "./libs/third-party/Steam.js";

import * as CliLib from "./libs/Cli.js";

//
// General Actions
//

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
		// Check Game Companies
		//

		if (strictMode)
		{
			const gameDevelopers = await prismaClient.gameCompany.findMany(
				{
					where:
					{
						type: "DEVELOPER" satisfies GameCompanySchemaLib.Type,

						game_id: game.id,
					},
				});
	
			if (gameDevelopers.length == 0)
			{
				problems.push("no gameDevelopers");
			}

			const gamePublishers = await prismaClient.gameCompany.findMany(
				{
					where:
					{
						type: "PUBLISHER" satisfies GameCompanySchemaLib.Type,

						game_id: game.id,
					},
				});

			if (gamePublishers.length == 0)
			{
				problems.push("no gamePublishers");
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
	// Download Game Images
	//

	const numberOfImagesDownloadedFromSteam = await GameCliLib.downloadImagesFromSteam(readlineInterface, game);
	
	console.log(chalk.green("Downloaded %d images from Steam for %s!", game.name), numberOfImagesDownloadedFromSteam);

	//
	// Create Game Platforms (if steamAppDetails is available)
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

	if (gameCreateOptions.steamOwnedGame != null)
	{
		// TODO
	}

	//
	// Add Related Data
	//

	await addGameCompanies(readlineInterface, game);

	await addGameEngines(readlineInterface, game);

	await addGamePlatforms(readlineInterface, game);

	await addGameInstallations(readlineInterface, game);

	await addGamePlaySessions(readlineInterface, game);

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

async function downloadGameImagesFromSteam(readlineInterface: readline.promises.Interface, game: Prisma.GameGetPayload<null>)
{
	const numberOfImagesDownloadedFromSteam = await GameCliLib.downloadImagesFromSteam(readlineInterface, game);

	console.log(chalk.green("%d images downloaded from Steam!"), numberOfImagesDownloadedFromSteam);
}

async function addGameCompanies(readlineInterface: readline.promises.Interface, game: Prisma.GameGetPayload<null>)
{	
	loop: while (true)
	{
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
}

// TODO: addGameLinks

// TODO: addGameModes

async function addGamePlatforms(readlineInterface: readline.promises.Interface, game: Prisma.GameGetPayload<null>)
{
	loop: while (true)
	{
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

// TODO: addGamePlayActions

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
	downloadGameImagesFromSteam:
	{
		description: "Download images for a game from Steam",
		execute: async (readlineInterface) =>
		{
			const game = await GameCliLib.searchAndChooseOne(readlineInterface);

			await downloadGameImagesFromSteam(readlineInterface, game);
		},
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