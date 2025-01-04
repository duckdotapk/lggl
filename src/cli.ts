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

import { prismaClient } from "./instances/prismaClient.js";

import * as GameModelLib from "./libs/models/Game.js";

import * as GameSchemaLib from "./libs/schemas/Game.js";
import * as GamePlayActionSchemaLib from "./libs/schemas/GamePlayAction.js";

import * as SteamThirdPartyLib from "./libs/third-party/Steam.js";

import * as CliLib from "./libs/Cli.js";
import * as FileSizeLib from "./libs/FileSize.js";

//
// Schemas
//

const ActionNameSchema = z.enum(
	[
		"addGame",
		"addGameInstallation",
		"addHistoricalPlaytime",
		"audit",
	]);

//
// Types
//

type ActionName = z.infer<typeof ActionNameSchema>;

type Action =
{
	description: string;
	execute: (readlineInterface: readline.promises.Interface) => Promise<void>;
};

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

	const imagePath = path.join(LGGL_DATA_DIRECTORY, "images", "game", game.id.toString(), type + path.extname(url));

	await fs.promises.mkdir(path.dirname(imagePath), { recursive: true });

	await fs.promises.writeFile(imagePath, imageBuffer);

	return true;
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
				const inputParseResult = z.number().int().min(1).safeParse(parseInt(input.trim()));

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

//
// Actions
//

async function addGame(readlineInterface: readline.promises.Interface)
{
	const steamAppId = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the game's steam app ID",
			defaultValue: null,
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

	// TODO: pull Steam App Info to use as default values

	const name = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the game's name",
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

	const isEarlyAccess = await CliLib.confirm(readlineInterface,
		{
			text: "Is this game in early access?",
			defaultValue: false,
		});

	const isFavorite = await CliLib.confirm(readlineInterface,
		{
			text: "Is this game a favorite?",
			defaultValue: false,
		});

	const isHidden = await CliLib.confirm(readlineInterface, 
		{
			text: "Is this game hidden?", 
			defaultValue: false
		});

	const isNsfw = await CliLib.confirm(readlineInterface, 
		{
			text: "Is this game NSFW?", 
			defaultValue: false
		});

	const isShelved = await CliLib.confirm(readlineInterface, 
		{
			text: "Is this game shelved?", 
			defaultValue: false
		});

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

	// TODO: prompt for gameDeveloperNames

	// TODO: prompt for gameEngineNames

	// TODO: prompt for gameGenreNames

	const gameInstallationPath = await CliLib.prompt(readlineInterface,
		{
			text: "Enter the game's installation path",
			defaultValue: null,
			validateAndTransform: async (input) => input,
		});

	// TODO: prompt for gameModes

	// TODO: prompt for gamePlatforms

	// TODO: prompt for gamePublisherNames

	const game = await prismaClient.$transaction(
		async (transactionClient) =>
		{
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
					},
				});

			if (gameInstallationPath != null)
			{
				const gameInstallationSize = await FileSizeLib.getFolderSize(gameInstallationPath);

				const [ fileSizeGibiBytes, fileSizeBytes ] = FileSizeLib.toGibiBytesAndBytes(gameInstallationSize);

				await transactionClient.gameInstallation.create(
					{
						data:
						{
							path: gameInstallationPath,
							fileSizeGibiBytes,
							fileSizeBytes,

							game_id: game.id,
						},
					});
			}

			if (steamAppId != null && gameInstallationPath != null)
			{
				await transactionClient.gamePlayAction.create(
					{
						data:
						{
							name: "Launch via Steam",
							type: "URL" satisfies GamePlayActionSchemaLib.Type,
							path: "steam://run/" + game.steamAppId,
							trackingPath: gameInstallationPath,

							game_id: game.id,
						},
					});

				// TODO: create historical gamePlayActionSessions
			}

			return game;
		});

	console.log("Game #%d (%s) created!", game.id, game.name);

	if (steamAppId != null)
	{
		const downloadImages = await CliLib.confirm(readlineInterface,
			{
				text: "Would you like to pull images for this game from Steam?",
				defaultValue: true,
			});

		if (downloadImages)
		{
			const imageUrls = await SteamThirdPartyLib.fetchImageUrls(steamAppId);

			await prismaClient.game.update(
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
		}
	}

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
				input = input.trim();

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

async function addHistoricalPlaytime(readlineInterface: readline.promises.Interface)
{
	const game = await searchForGame(readlineInterface);
	
	const gamePlayAction = await CliLib.prompt(readlineInterface, 
		{
			text: "Choose which game play action you want to associate this playtime with",
			options: game.gamePlayActions.map(
				(gamePlayAction) =>
				{
					return {
						value: gamePlayAction.id.toString(),
						description: gamePlayAction.name,
					};
				}),
			validateAndTransform: async (input) =>
			{
				const inputParseResult = z.number().int().min(1).safeParse(parseInt(input.trim()));

				if (!inputParseResult.success)
				{
					throw new CliLib.RetryableError("Invalid game play action ID.");
				}

				const id = inputParseResult.data;

				const gamePlayAction = game.gamePlayActions.find((gamePlayAction) => gamePlayAction.id == id);

				if (gamePlayAction == null)
				{
					throw new CliLib.RetryableError("No game play action found with that ID.");
				}

				return gamePlayAction;
			},
		});

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
				const inputParseResult = z.number().int().min(1).safeParse(parseInt(input.trim()));

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
				input = input.trim();

				return input.length > 0 ? input : null;
			},
		});

	readlineInterface.close();

	const gamePlayActionSession = await prismaClient.$transaction(
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

			return await transactionClient.gamePlayActionSession.create(
				{
					data:
					{
						startDate: DateTime.fromSeconds(0).toJSDate(),
						endDate: DateTime.fromSeconds(playTimeSeconds).toJSDate(),
						playTimeSeconds,
						addedToTotal: true,
						isHistorical: true,
						notes,
		
						gamePlayAction_id: gamePlayAction.id,
						platform_id: platform.id,
					},
				});
		});

	console.log("Created historical game play action session with ID: %d", gamePlayActionSession.id);

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

				if (shouldFixData)
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
				include:
				{
					gamePlayActionSessions: true,
				},
			});

		if (gamePlayActions.length == 0)
		{
			problems.push("no gamePlayActions");
		}
		else
		{
			let playTimeTotalSecondsFromGamePlayActionSessions = 0;

			for (const gamePlayAction of gamePlayActions)
			{
				for (const gamePlayActionSession of gamePlayAction.gamePlayActionSessions)
				{
					playTimeTotalSecondsFromGamePlayActionSessions += gamePlayActionSession.playTimeSeconds;
				}
			}

			if (game.playTimeTotalSeconds != playTimeTotalSecondsFromGamePlayActionSessions)
			{
				const difference = game.playTimeTotalSeconds - playTimeTotalSecondsFromGamePlayActionSessions;

				problems.push("playTimeTotalSeconds differs from gamePlayActionSessions total: " + difference);
			}
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

const actions: Record<ActionName, Action> =
{
	addGame:
	{
		description: "Add a new game to your library",
		execute: async (readlineInterface) => addGame(readlineInterface),
	},
	addGameInstallation:
	{
		description: "Add a new game installation to an existing game",
		execute: async (readlineInterface) => addGameInstallation(readlineInterface),
	},
	addHistoricalPlaytime:
	{
		description: "Add historical playtime to an existing game",
		execute: async (readlineInterface) => addHistoricalPlaytime(readlineInterface),
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
	
		const actionName = await CliLib.prompt(readlineInterface,
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
						return "exit";
					}

					const inputParseResult = ActionNameSchema.safeParse(input);
	
					if (!inputParseResult.success)
					{
						throw new CliLib.RetryableError("Invalid action: " + input);
					}
	
					return inputParseResult.data;
				},
			});
	
		if (actionName == "exit")
		{
			break loop;
		}
	
		console.clear();
	
		const action = actions[actionName];
	
		await action.execute(readlineInterface);
	}
	
	readlineInterface.close();

	await prismaClient.$disconnect();
}

await main();