//
// Imports
//

import "source-map-support/register.js";

import fs from "node:fs";
import path from "node:path";

import chalk from "chalk";
import unzipper from "unzipper";

import { LGGL_DATA_DIRECTORY } from "./env/LGGL_DATA_DIRECTORY.js";
import { LGGL_PORT } from "./env/LGGL_PORT.js";

import { prismaClient } from "./instances/prismaClient.js";
import { routerMiddleware, server } from "./instances/server.js";

//
// Create Data Directory
//

await fs.promises.mkdir(LGGL_DATA_DIRECTORY, { recursive: true });

//
// Download Font Awesome Free
//

const fontAwesomeDirectory = path.join(LGGL_DATA_DIRECTORY, "fontawesome");

if (!fs.existsSync(fontAwesomeDirectory))
{
	await fs.promises.mkdir(fontAwesomeDirectory, { recursive: true });

	try
	{
		console.log("[Server] Downloading Font Awesome Free...");

		const fontAwesomeUrl = "https://use.fontawesome.com/releases/v6.7.2/fontawesome-free-6.7.2-web.zip";

		const response = await fetch(fontAwesomeUrl);

		if (!response.ok)
		{
			throw new Error("response not ok: " + response.status);
		}

		if (response.body == null)
		{
			throw new Error("response body is null");
		}

		const fontAwesomeZipPath = path.join(LGGL_DATA_DIRECTORY, "fontawesome.zip");

		await fs.promises.writeFile(path.join(LGGL_DATA_DIRECTORY, "fontawesome.zip"), Buffer.from(await response.arrayBuffer()));

		console.log("[Server] Extracting Font Awesome Free...");

		const directory = await unzipper.Open.file(fontAwesomeZipPath);

		for (const file of directory.files)
		{
			if (file.type != "File")
			{
				continue;
			}

			const filePathComponents = file.path.split("/");

			if (filePathComponents[1] != "css" && filePathComponents[1] != "webfonts")
			{
				continue;
			}

			const filePath = filePathComponents.slice(1).join(path.sep);

			await fs.promises.mkdir(path.dirname(path.join(fontAwesomeDirectory, filePath)), { recursive: true });

			await fs.promises.writeFile(path.join(fontAwesomeDirectory, filePath), await file.buffer());
		}

		await fs.promises.unlink(fontAwesomeZipPath);
	}
	catch (error)
	{
		await fs.promises.rm(fontAwesomeDirectory,
			{
				recursive: true,
				force: true,
			});

		console.error(chalk.red("[Server] Failed to download Font Awesome Free, some icons will not work:"), error);
	}
}

//
// Add Unadded Play Sessions
//

const gamePlaySessions = await prismaClient.gamePlaySession.findMany(
	{
		where:
		{
			addedToTotal: false,
		},
		include:
		{
			game: true,
		},
	});

for (const gamePlaySession of gamePlaySessions)
{
	console.log("[Server] Adding play session %d to play time total for %s...", gamePlaySession.id, gamePlaySession.game.name);

	await prismaClient.$transaction(
		async (transactionClient) =>
		{
			await transactionClient.game.update(
				{
					where:
					{
						id: gamePlaySession.game_id,
					},
					data:
					{
						playTimeTotalSeconds: { increment: gamePlaySession.playTimeSeconds },
					},
				});

			await transactionClient.gamePlaySession.update(
				{
					where:
					{
						id: gamePlaySession.id,
					},
					data:
					{
						addedToTotal: true,
					},
				});
		});
}

//
// Load Routes
//

const routes = await routerMiddleware.loadRoutesDirectory(path.join(import.meta.dirname, "routes"));

console.log("[Server] Loaded " + routes.length + " routes.");

//
// Start Server
//

await server.start(LGGL_PORT);

console.log("[Server] Listening on port " + LGGL_PORT + "...");