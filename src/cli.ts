//
// Imports
//

import fs from "node:fs";
import readline from "node:readline";

import chalk from "chalk";
import { z } from "zod";

import { LGGL_STEAM_API_KEY } from "./env/LGGL_STEAM_API_KEY.js";
import { LGGL_STEAM_USER_ID } from "./env/LGGL_STEAM_USER_ID.js";

import { prismaClient } from "./instances/prismaClient.js";

import * as EngineCliLib from "./libs/cli/Engine.js";
import * as GameCliLib from "./libs/cli/Game.js";
import * as GameEngineCliLib from "./libs/cli/GameEngine.js";
import * as GameInstallationCliLib from "./libs/cli/GameInstallation.js";
import * as GamePlaySessionCliLib from "./libs/cli/GamePlaySession.js";
import * as PlatformCliLib from "./libs/cli/Platform.js";
import * as SeriesCliLib from "./libs/cli/Series.js";
import * as SeriesGameCliLib from "./libs/cli/SeriesGame.js";

import * as GameModelLib from "./libs/models/Game.js";

import * as SteamThirdPartyLib from "./libs/third-party/Steam.js";

import * as CliLib from "./libs/Cli.js";
import * as NetworkLib from "./libs/Network.js";

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
		description: "Audit your game library for potential issues",
		execute: async (readlineInterface) =>
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
		},
	},

	createEngine:
	{
		description: "Add a new engine to your library",
		execute: async (readlineInterface) =>
		{
			const engine = await EngineCliLib.create(readlineInterface);

			console.log("Engine #%d created!", engine.id);
		},
	},

	createGame:
	{
		description: "Add a new game to your library",
		execute: async (readlineInterface) =>
		{
			const game = await GameCliLib.create(readlineInterface);

			console.log("Game #%d created!", game.id);
		},
	},
	downloadGameImagesFromSteam:
	{
		description: "Download images for a game from Steam",
		execute: async (readlineInterface) =>
		{
			const games = await GameCliLib.search(readlineInterface);

			const game = await GameCliLib.choose(readlineInterface, games);

			const steamAppId = game.steamAppId ?? await CliLib.prompt(readlineInterface,
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

			const ownedGames = await SteamThirdPartyLib.fetchOwnedGames(LGGL_STEAM_API_KEY, LGGL_STEAM_USER_ID);

			const ownedGame = ownedGames.games.find((game) => game.appid == steamAppId) ?? null;

			const imageUrls = SteamThirdPartyLib.fetchImageUrls(steamAppId, ownedGame);

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

			console.log("Images downloaded!");
		},
	},

	createGameEngine:
	{
		description: "Add an engine to an existing game",
		execute: async (readlineInterface) =>
		{
			const gameEngine = await GameEngineCliLib.create(readlineInterface);

			console.log("Game engine #%d created!", gameEngine.id);
		},
	},

	createGameInstallation:
	{
		description: "Add a new game installation to an existing game",
		execute: async (readlineInterface) =>
		{
			const gameInstallation = await GameInstallationCliLib.create(readlineInterface);

			console.log("Game installation #%d created!", gameInstallation.id);
		},
	},

	createGamePlaySession:
	{
		description: "Add a historical game play session to an existing game",
		execute: async (readlineInterface) =>
		{
			const gamePlaySession = await GamePlaySessionCliLib.create(readlineInterface);

			console.log("Game play session #%d created!", gamePlaySession.id);
		},
	},

	createPlatform:
	{
		description: "Create a new platform in your library",
		execute: async (readlineInterface) =>
		{
			const platform = await PlatformCliLib.create(readlineInterface);

			console.log("Platform #%d created!", platform.id);
		},
	},

	createSeries:
	{
		description: "Add a new series to your library",
		execute: async (readlineInterface) =>
		{
			const series = await SeriesCliLib.create(readlineInterface);

			console.log("Series #%d created!", series.id);
		},
	},

	createSeriesGame:
	{
		description: "Add a game to a series",
		execute: async (readlineInterface) =>
		{
			const seriesGame = await SeriesGameCliLib.create(readlineInterface);

			console.log("Series game #%d created!", seriesGame.id);
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

		await CliLib.pause(readlineInterface);
	}
	
	readlineInterface.close();

	await prismaClient.$disconnect();
}

await main();