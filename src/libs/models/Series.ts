//
// Imports
//

import { Prisma } from "@prisma/client";

import { NameSeriesGroupManager, NumberOfGamesSeriesGroupManager } from "../../classes/SeriesGroupManager.js";

import * as SettingModelLib from "../models/Setting.js";

//
// Create/Find/Update/Delete Functions
//

export async function createGroupManager(transactionClient: Prisma.TransactionClient, settings: SettingModelLib.Settings, selectedSeries: Prisma.SeriesGetPayload<null> | null)
{
	const seriesList = await transactionClient.series.findMany(
		{
			include:
			{
				seriesGames: true,
			},
		});

	switch (settings.seriesGroupMode)
	{
		case "name":
			return new NameSeriesGroupManager(settings, seriesList, selectedSeries);

		case "numberOfGames":
			return new NumberOfGamesSeriesGroupManager(settings, seriesList, selectedSeries);
	}
}