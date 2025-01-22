//
// Imports
//

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { GroupManager } from "./GroupManager.js";

import { HumanDateTime } from "../components/basic/HumanDateTime.js";

//
// Class
//

export abstract class SeriesGroupManager<T extends Prisma.SeriesGetPayload<null> = Prisma.SeriesGetPayload<null>> extends GroupManager<T>
{
	override getItemHref(series: T)
	{
		return "/companies/view/" + series.id;
	}

	override getItemIconName(_series: T)
	{
		return "fa-solid fa-list-timeline";
	}

	override getItemName(series: T)
	{
		return series.name;
	}

	override getItemInfo(series: T)
	{
		return [ "Last updated ", HumanDateTime(DateTime.fromJSDate(series.lastUpdatedDate)) ];
	}
}

export class NameSeriesGroupManager extends SeriesGroupManager
{
	override sortModels(seriesList: Prisma.SeriesGetPayload<null>[])
	{
		return seriesList.toSorted((a, b) => a.name.localeCompare(b.name));
	}

	override groupModels(seriesList: Prisma.SeriesGetPayload<null>[])
	{
		for (const series of seriesList)
		{
			const groupName = GroupManager.getNameGroupName(series.name);

			this.addModelToGroup(groupName, series);
		}

		return Array.from(this.groupsByName.values());
	}
}

export type NumberOfGamesSeriesGroupManagerSeries = Prisma.SeriesGetPayload<{ include: { seriesGames: true } }>;

export class NumberOfGamesSeriesGroupManager extends SeriesGroupManager<NumberOfGamesSeriesGroupManagerSeries>
{
	override sortModels(seriesList: NumberOfGamesSeriesGroupManagerSeries[])
	{
		return seriesList.toSorted((a, b) => b.seriesGames.length - a.seriesGames.length);
	}

	override groupModels(seriesList: NumberOfGamesSeriesGroupManagerSeries[])
	{
		for (const series of seriesList)
		{
			const groupName = series.seriesGames.length + " game" + (series.seriesGames.length == 1 ? "" : "s");

			this.addModelToGroup(groupName, series);
		}

		return Array.from(this.groupsByName.values());
	}
}