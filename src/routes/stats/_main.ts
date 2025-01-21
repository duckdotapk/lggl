//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { shortEnglishHumanizer2 } from "../../instances/humanizer.js";
import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import { view } from "../../views/stats/_main.js";

import * as FileSizeLib from "../../libs/FileSize.js";
import * as HumanizationLib from "../../libs/Humanization.js";
import * as StatisticLib from "../../libs/Statistic.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/stats",
	handler: async (context) =>
	{
		//
		// Find Games
		//

		const games = await prismaClient.game.findMany(
			{
				include:
				{
					gameInstallations: true,
				},
			});

		//
		// Create StatCategoryManager
		//

		const statCategoryManager = new StatisticLib.StatCategoryManager();

		//
		// Create Game Stats
		//

		const gamesStatCategory = statCategoryManager.addCategory("Games");

		gamesStatCategory.addStat("Number", games.length.toLocaleString());

		let totalGamePlayTimeSeconds = 0;

		for (const game of games)
		{
			totalGamePlayTimeSeconds += game.playTimeTotalSeconds;
		}

		gamesStatCategory.addStat("Total play time", shortEnglishHumanizer2(totalGamePlayTimeSeconds * 1000));

		//
		// Create Game Installation Stats
		//

		const gameInstallationsStatCategory = statCategoryManager.addCategory("Game Installations");

		let numberOfGameInstallations = 0;

		for (const game of games)
		{
			numberOfGameInstallations += game.gameInstallations.length;
		}

		gameInstallationsStatCategory.addStat("Number", numberOfGameInstallations.toLocaleString());

		let totalGameInstallationFileSizeBytes = 0n;

		for (const game of games)
		{
			for (const gameInstallation of game.gameInstallations)
			{
				const fileSize = FileSizeLib.fromGibiBytes(gameInstallation.fileSizeGibiBytes, gameInstallation.fileSizeBytes);

				totalGameInstallationFileSizeBytes += fileSize;
			}
		}

		gameInstallationsStatCategory.addStat("Total file size",
			[
				HumanizationLib.formatBytesAsGigabytes(totalGameInstallationFileSizeBytes),
				" (",
				HumanizationLib.formatBytesAsGibibytes(totalGameInstallationFileSizeBytes),
				")",
			]);

		//
		// Render View
		//

		context.renderComponent(view(
			{
				statCategoryManager,
			}));
	},
};