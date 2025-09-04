//
// Imports
//

import { Child } from "@donutteam/document-builder";
import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { GroupManager, GroupManagerGroup } from "./GroupManager.js";

import { HumanDateTime } from "../components/basic/HumanDateTime.js";

import * as GameModelLib from "../libs/models/Game.js";

import * as HumanizationLib from "../libs/Humanization.js";

//
// Class
//

export type GameGroupManagerGame = Prisma.GameGetPayload<{ include: { gameInstallations: true } }>;

export abstract class GameGroupManager<T extends GameGroupManagerGame = GameGroupManagerGame> extends GroupManager<T>
{
	override filterModels(games: T[])
	{
		if (!this.settings.showRegularGames)
		{
			games = games.filter((game) => game.isHidden || game.isNsfw);
		}

		if (!this.settings.showHiddenGames)
		{
			games = games.filter((game) => !game.isHidden);
		}

		if (!this.settings.showNsfwGames)
		{
			games = games.filter((game) => !game.isNsfw);
		}

		return games;
	}

	override getItemHref(game: T)
	{
		return "/games/view/" + game.id;
	}

	override getItemAttributes(game: T)
	{
		return {
			"data-is-installed": game.gameInstallations.length > 0,
		};
	}

	override getItemIconName(game: T)
	{
		return game.hasIconImage
			? "/data/images/games/" + game.id + "/icon.jpg"
			: "fa-solid fa-gamepad-modern";
	}

	override getItemName(game: T)
	{
		return game.name;
	}

	override getItemInfo(game: T, _group: GroupManagerGroup<T>): Child
	{
		return game.lastPlayedDate != null
			? [ "Last played ", HumanDateTime(DateTime.fromJSDate(game.lastPlayedDate)) ]
			: null;
	}
}

export class CompletionStatusGameGroupManager extends GameGroupManager
{
	override getItemInfo(game: GameGroupManagerGame, group: GroupManagerGroup<GameGroupManagerGame>)
	{
		if (group.name != "Favorites")
		{
			return null;
		}

		return game.completionStatus != null
			? GameModelLib.getCompletionStatusName(game.completionStatus)
			: null;
	}

	override sortModels(games: GameGroupManagerGame[])
	{
		return games.toSorted((a, b) => a.sortName.localeCompare(b.sortName));
	}

	override groupModels(games: GameGroupManagerGame[])
	{
		this.addGroup("Favorites");

		this.addGroup(GameModelLib.getCompletionStatusName("ONE_HUNDRED_PERCENT"));
		this.addGroup(GameModelLib.getCompletionStatusName("COMPLETE"));
		this.addGroup(GameModelLib.getCompletionStatusName("IN_PROGRESS"));
		this.addGroup(GameModelLib.getCompletionStatusName("TODO"));

		this.addGroup("Shelved");

		this.addGroup("-");

		for (const game of games)
		{
			if (this.settings.showFavoritesGroup && game.isFavorite)
			{
				this.addModelToGroup("Favorites", game);
			}

			if (game.isShelved)
			{
				this.addModelToGroup("Shelved", game);

				continue;
			}
			
			if (game.completionStatus == null)
			{
				this.addModelToGroup("-", game);

				continue;
			}

			this.addModelToGroup(GameModelLib.getCompletionStatusName(game.completionStatus), game);
		}

		return Array.from(this.groupsByName.values());
	}
}

export class CreatedDateGameGroupManager extends GameGroupManager
{
	override getItemInfo(game: GameGroupManagerGame)
	{
		return [ "Created ", HumanDateTime(DateTime.fromJSDate(game.createdDate)) ];
	}

	override sortModels(games: GameGroupManagerGame[])
	{
		return games.toSorted((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
	}

	override groupModels(games: GameGroupManagerGame[])
	{
		this.addGroup("Favorites", 1);

		for (const game of games)
		{
			if (this.settings.showFavoritesGroup && game.isFavorite)
			{
				this.addModelToGroup("Favorites", game);
			}

			const createdDateTime = DateTime.fromJSDate(game.createdDate);

			const groupName = GroupManager.getDateGroupName(createdDateTime);

			this.addModelToGroup(groupName, game);
		}

		return Array.from(this.groupsByName.values());
	}
}

export type DeveloperGameGroupManagerGame = GameGroupManagerGame & Prisma.GameGetPayload<{ include: { gameCompanies: { include: { company: true } } } }>;

export class DeveloperGameGroupManager extends GameGroupManager<DeveloperGameGroupManagerGame>
{
	override getItemInfo(game: DeveloperGameGroupManagerGame, group: GroupManagerGroup<DeveloperGameGroupManagerGame>)
	{
		if (group.name != "Favorites")
		{
			return null;
		}

		const companyNames = game.gameCompanies.filter((gameCompany) => gameCompany.type == "DEVELOPER").map((gameCompany) => gameCompany.company.name);

		if (companyNames.length == 0)
		{
			return null;
		}

		return [
			"Developed by ",
			companyNames.join(", "),
		];
	}

	override sortModels(games: DeveloperGameGroupManagerGame[])
	{
		return games.toSorted((a, b) => a.sortName.localeCompare(b.sortName));
	}

	override groupModels(games: DeveloperGameGroupManagerGame[])
	{
		this.addGroup("Favorites", 1);

		this.addGroup("No Developers", -1);

		for (const game of games)
		{
			if (this.settings.showFavoritesGroup && game.isFavorite)
			{
				this.addModelToGroup("Favorites", game);
			}

			const gameCompanies = game.gameCompanies.filter((gameCompany) => gameCompany.type == "DEVELOPER");

			if (gameCompanies.length == 0)
			{
				this.addModelToGroup("No Developers", game);

				continue;
			}

			for (const gameCompany of gameCompanies)
			{
				this.addModelToGroup(gameCompany.company.name, game);
			}
		}

		return Array.from(this.groupsByName.values());
	}

	override sortGroups(groups: GroupManagerGroup<DeveloperGameGroupManagerGame>[])
	{
		return groups.toSorted(
			(a, b) =>
			{
				if (a.sortOrder > b.sortOrder)
				{
					return -1;
				}

				if (a.sortOrder < b.sortOrder)
				{
					return 1;
				}

				return a.name.localeCompare(b.name);
			});
	}
}

export type EngineGameGroupManagerGame = GameGroupManagerGame & Prisma.GameGetPayload<{ include: { gameEngines: { include: { engine: true } } } }>;

export class EngineGameGroupManager extends GameGroupManager<EngineGameGroupManagerGame>
{
	override getItemInfo(game: EngineGameGroupManagerGame, group: GroupManagerGroup<EngineGameGroupManagerGame>)
	{
		if (group.name != "Favorites")
		{
			return null;
		}

		const engineNames = game.gameEngines.map(
			(gameEngine) =>
			{
				if (gameEngine.version != null)
				{
					return gameEngine.engine.name + " " + gameEngine.version;
				}

				return gameEngine.engine.name;
			});

		if (engineNames.length == 0)
		{
			return null;
		}

		return [
			"Powered by ",
			engineNames.join(", "),
		];
	}

	override sortModels(games: EngineGameGroupManagerGame[])
	{
		return games.toSorted((a, b) => a.sortName.localeCompare(b.sortName));
	}

	override groupModels(games: EngineGameGroupManagerGame[])
	{
		this.addGroup("Favorites", 1);

		this.addGroup("No Engines", -1);

		for (const game of games)
		{
			if (this.settings.showFavoritesGroup && game.isFavorite)
			{
				this.addModelToGroup("Favorites", game);
			}

			if (game.gameEngines.length == 0)
			{
				this.addModelToGroup("No Engines", game);

				continue;
			}

			for (const gameEngine of game.gameEngines)
			{
				if (gameEngine.version == null)
				{
					this.addModelToGroup(gameEngine.engine.name, game);
				}
				else
				{
					this.addModelToGroup(gameEngine.engine.name + " " + gameEngine.version, game);
				}
			}
		}

		return Array.from(this.groupsByName.values());
	}

	override sortGroups(groups: GroupManagerGroup<EngineGameGroupManagerGame>[])
	{
		return groups.toSorted(
			(a, b) =>
			{
				if (a.sortOrder > b.sortOrder)
				{
					return -1;
				}

				if (a.sortOrder < b.sortOrder)
				{
					return 1;
				}

				return a.name.localeCompare(b.name);
			});
	}
}

export class FirstCompletedDateGameGroupManager extends GameGroupManager
{
	override getItemInfo(game: GameGroupManagerGame)
	{
		return game.firstCompletedDate != null && !game.firstCompletedDateApproximated
			? [ "First completed ", HumanDateTime(DateTime.fromJSDate(game.firstCompletedDate), DateTime.DATE_MED) ]
			: null;
	}

	override sortModels(games: GameGroupManagerGame[])
	{
		return games
			.map((game) => ({ game, firstCompletedDate: game.firstCompletedDate ?? new Date(0) }))
			.sort((a, b) =>
			{
				if (a.firstCompletedDate > b.firstCompletedDate)
				{
					return -1;
				}

				if (a.firstCompletedDate < b.firstCompletedDate)
				{
					return 1;
				}

				return a.game.sortName.localeCompare(b.game.sortName);
			})
			.map((item) => item.game);
	}

	override groupModels(games: GameGroupManagerGame[])
	{
		this.addGroup("Favorites", 1);

		this.addGroup("No First Completed Date", -1);

		for (const game of games)
		{
			if (this.settings.showFavoritesGroup && game.isFavorite)
			{
				this.addModelToGroup("Favorites", game);
			}

			if (game.firstCompletedDate == null)
			{
				this.addModelToGroup("No First Completed Date", game);

				continue;
			}

			const firstCompletedDateTime = DateTime.fromJSDate(game.firstCompletedDate);

			const groupName = GroupManager.getDateGroupName(firstCompletedDateTime);

			this.addModelToGroup(groupName, game);
		}

		return Array.from(this.groupsByName.values());
	}
}

export class FirstPlayedDateGameGroupManager extends GameGroupManager
{
	override getItemInfo(game: GameGroupManagerGame)
	{
		return game.firstPlayedDate != null && !game.firstPlayedDateApproximated
			? [ "First played ", HumanDateTime(DateTime.fromJSDate(game.firstPlayedDate), DateTime.DATE_MED) ]
			: null;
	}

	override sortModels(games: GameGroupManagerGame[])
	{
		return games
			.map((game) => ({ game, firstPlayedDate: game.firstPlayedDate ?? new Date(0) }))
			.sort((a, b) =>
			{
				if (a.firstPlayedDate > b.firstPlayedDate)
				{
					return -1;
				}

				if (a.firstPlayedDate < b.firstPlayedDate)
				{
					return 1;
				}

				return a.game.sortName.localeCompare(b.game.sortName);
			})
			.map((item) => item.game);
	}

	override groupModels(games: GameGroupManagerGame[])
	{
		this.addGroup("Favorites", 1);

		this.addGroup("No First Played Date", -1);

		for (const game of games)
		{
			if (this.settings.showFavoritesGroup && game.isFavorite)
			{
				this.addModelToGroup("Favorites", game);
			}

			if (game.firstPlayedDate == null)
			{
				this.addModelToGroup("No First Played Date", game);

				continue;
			}

			const firstPlayedDateTime = DateTime.fromJSDate(game.firstPlayedDate);

			const groupName = GroupManager.getDateGroupName(firstPlayedDateTime);

			this.addModelToGroup(groupName, game);
		}

		return Array.from(this.groupsByName.values());
	}
}

export class LastPlayedDateGameGroupManager extends GameGroupManager
{
	override getItemInfo(game: GameGroupManagerGame)
	{
		return game.lastPlayedDate != null
			? [ "Last played ", HumanDateTime(DateTime.fromJSDate(game.lastPlayedDate), DateTime.DATE_MED) ]
			: null;
	}

	override sortModels(games: GameGroupManagerGame[])
	{
		return games
			.map((game) => ({ game, lastPlayedDate: game.lastPlayedDate ?? new Date(0) }))
			.sort((a, b) =>
			{
				if (a.lastPlayedDate > b.lastPlayedDate)
				{
					return -1;
				}

				if (a.lastPlayedDate < b.lastPlayedDate)
				{
					return 1;
				}

				return a.game.sortName.localeCompare(b.game.sortName);
			})
			.map((item) => item.game);
	}

	override groupModels(games: GameGroupManagerGame[])
	{
		this.addGroup("Favorites", 1);

		this.addGroup("No Last Played Date", -1);

		for (const game of games)
		{
			if (this.settings.showFavoritesGroup && game.isFavorite)
			{
				this.addModelToGroup("Favorites", game);
			}

			if (game.lastPlayedDate == null)
			{
				this.addModelToGroup("No Last Played Date", game);

				continue;
			}

			const lastPlayedDateTime = DateTime.fromJSDate(game.lastPlayedDate);

			const groupName = GroupManager.getDateGroupName(lastPlayedDateTime);

			this.addModelToGroup(groupName, game);
		}

		return Array.from(this.groupsByName.values());
	}
}

export class NameGameGroupManager extends GameGroupManager
{
	override sortModels(games: GameGroupManagerGame[])
	{
		return games.toSorted((a, b) => a.sortName.localeCompare(b.sortName));
	}

	override groupModels(games: GameGroupManagerGame[])
	{
		this.addGroup("Favorites", 1);

		for (const game of games)
		{
			if (this.settings.showFavoritesGroup && game.isFavorite)
			{
				this.addModelToGroup("Favorites", game);
			}

			const groupName = GroupManager.getNameGroupName(game.name);

			this.addModelToGroup(groupName, game);
		}

		return Array.from(this.groupsByName.values());
	}
}

export class PlayTimeTotalSecondsGameGroupManager extends GameGroupManager
{
	override getItemInfo(game: GameGroupManagerGame)
	{
		return game.playTimeTotalSeconds > 0
			? [ "Played ", HumanizationLib.formatSeconds(game.playTimeTotalSeconds, false) ]
			: null;
	}

	override sortModels(games: GameGroupManagerGame[])
	{
		return games.toSorted(
			(a, b) =>
			{
				if (a.playTimeTotalSeconds > b.playTimeTotalSeconds)
				{
					return -1;
				}

				if (a.playTimeTotalSeconds < b.playTimeTotalSeconds)
				{
					return 1;
				}

				return a.sortName.localeCompare(b.sortName);
			});
	}

	override groupModels(games: GameGroupManagerGame[])
	{
		this.addGroup("Favorites", 1);

		for (const game of games)
		{
			if (this.settings.showFavoritesGroup && game.isFavorite)
			{
				this.addModelToGroup("Favorites", game);
			}

			const playTimeTotalHours = game.playTimeTotalSeconds / 3600;

			if (playTimeTotalHours >= 1000)
			{
				this.addModelToGroup("1000+ hours", game);
			}
			else if (playTimeTotalHours >= 750)
			{
				this.addModelToGroup("750 to 1000 hours", game);
			}
			else if (playTimeTotalHours >= 500)
			{
				this.addModelToGroup("500 to 750 hours", game);
			}
			else if (playTimeTotalHours >= 250)
			{
				this.addModelToGroup("250 to 500 hours", game);
			}
			else if (playTimeTotalHours >= 100)
			{
				this.addModelToGroup("100 to 250 hours", game);
			}
			else if (playTimeTotalHours >= 50)
			{
				this.addModelToGroup("50 to 100 hours", game);
			}
			else if (playTimeTotalHours >= 10)
			{
				this.addModelToGroup("10 to 50 hours", game);
			}
			else if (playTimeTotalHours >= 5)
			{
				this.addModelToGroup("5 to 10 hours", game);
			}
			else if (playTimeTotalHours >= 4)
			{
				this.addModelToGroup("4 to 5 hours", game);
			}
			else if (playTimeTotalHours >= 3)
			{
				this.addModelToGroup("3 to 4 hours", game);
			}
			else if (playTimeTotalHours >= 2)
			{
				this.addModelToGroup("2 to 3 hours", game);
			}
			else if (playTimeTotalHours >= 1)
			{
				this.addModelToGroup("1 to 2 hours", game);
			}
			else if (playTimeTotalHours > 0)
			{
				this.addModelToGroup("Under 1 hour", game);
			}
			else
			{
				this.addModelToGroup("Unplayed", game);
			}
		}

		return Array.from(this.groupsByName.values());
	}
}

export type PublisherGameGroupManagerGame = GameGroupManagerGame & Prisma.GameGetPayload<{ include: { gameCompanies: { include: { company: true } } } }>;

export class PublisherGameGroupManager extends GameGroupManager<PublisherGameGroupManagerGame>
{
	override getItemInfo(game: PublisherGameGroupManagerGame, group: GroupManagerGroup<PublisherGameGroupManagerGame>)
	{
		if (group.name != "Favorites")
		{
			return null;
		}

		const companyNames = game.gameCompanies.filter((gameCompany) => gameCompany.type == "PUBLISHER").map((gameCompany) => gameCompany.company.name);

		if (companyNames.length == 0)
		{
			return null;
		}

		return [
			"Published by ",
			companyNames.join(", "),
		];
	}

	override sortModels(games: PublisherGameGroupManagerGame[])
	{
		return games.toSorted((a, b) => a.sortName.localeCompare(b.sortName));
	}

	override groupModels(games: PublisherGameGroupManagerGame[])
	{
		this.addGroup("Favorites", 1);

		this.addGroup("No Publishers", -1);

		for (const game of games)
		{
			if (this.settings.showFavoritesGroup && game.isFavorite)
			{
				this.addModelToGroup("Favorites", game);
			}

			const gameCompanies = game.gameCompanies.filter((gameCompany) => gameCompany.type == "PUBLISHER");

			if (gameCompanies.length == 0)
			{
				this.addModelToGroup("No Publishers", game);

				continue;
			}

			for (const gameCompany of gameCompanies)
			{
				this.addModelToGroup(gameCompany.company.name, game);
			}
		}

		return Array.from(this.groupsByName.values());
	}

	override sortGroups(groups: GroupManagerGroup<PublisherGameGroupManagerGame>[])
	{
		return groups.toSorted(
			(a, b) =>
			{
				if (a.sortOrder > b.sortOrder)
				{
					return -1;
				}

				if (a.sortOrder < b.sortOrder)
				{
					return 1;
				}

				return a.name.localeCompare(b.name);
			});
	}
}

export class PurchaseDateGameGroupManager extends GameGroupManager
{
	override getItemInfo(game: GameGroupManagerGame)
	{
		return game.purchaseDate != null
			? [ "Purchased ", HumanDateTime(DateTime.fromJSDate(game.purchaseDate), DateTime.DATE_MED) ]
			: null;
	}

	override sortModels(games: GameGroupManagerGame[])
	{
		return games
			.map((game) => ({ game, purchaseDate: game.purchaseDate ?? new Date(0) }))
			.sort((a, b) =>
			{
				if (a.purchaseDate > b.purchaseDate)
				{
					return -1;
				}

				if (a.purchaseDate < b.purchaseDate)
				{
					return 1;
				}

				return a.game.sortName.localeCompare(b.game.sortName);
			})
			.map((item) => item.game);
	}

	override groupModels(games: GameGroupManagerGame[])
	{
		this.addGroup("Favorites", 1);

		this.addGroup("Family Shared", -1);

		this.addGroup("No Purchase Date", -1);

		for (const game of games)
		{
			if (this.settings.showFavoritesGroup && game.isFavorite)
			{
				this.addModelToGroup("Favorites", game);
			}

			if (game.isFamilyShared)
			{
				this.addModelToGroup("Family Shared", game);

				continue;
			}

			if (game.purchaseDate == null)
			{
				this.addModelToGroup("No Purchase Date", game);

				continue;
			}

			const lastPlayedDateTime = DateTime.fromJSDate(game.purchaseDate);

			const groupName = GroupManager.getDateGroupName(lastPlayedDateTime);

			this.addModelToGroup(groupName, game);
		}

		return Array.from(this.groupsByName.values());
	}
}

export type SeriesGameGroupManagerGame = GameGroupManagerGame & Prisma.GameGetPayload<{ include: { seriesGames: { include: { series: true } } } }>;

export class SeriesGameGroupManager extends GameGroupManager<SeriesGameGroupManagerGame>
{
	override getItemInfo(game: SeriesGameGroupManagerGame, group: GroupManagerGroup<SeriesGameGroupManagerGame>)
	{
		if (group.name != "Favorites")
		{
			return null;
		}

		const seriesNames = game.seriesGames.map((seriesGame) => seriesGame.series.name);

		if (seriesNames.length == 0)
		{
			return null;
		}

		return [
			"Part of ",
			seriesNames.join(", "),
		];
	}

	override sortModels(games: SeriesGameGroupManagerGame[])
	{
		return games.toSorted((a, b) => a.sortName.localeCompare(b.sortName));
	}

	override groupModels(games: SeriesGameGroupManagerGame[])
	{
		this.addGroup("Favorites", 1);

		this.addGroup("No Series", -1);

		for (const game of games)
		{
			if (this.settings.showFavoritesGroup && game.isFavorite)
			{
				this.addModelToGroup("Favorites", game);
			}

			if (game.seriesGames.length == 0)
			{
				this.addModelToGroup("No Series", game);

				continue;
			}

			for (const seriesGame of game.seriesGames)
			{
				this.addModelToGroup(seriesGame.series.name, game);
			}
		}

		return Array.from(this.groupsByName.values());
	}

	override sortGroups(groups: GroupManagerGroup<SeriesGameGroupManagerGame>[])
	{
		return groups.toSorted(
			(a, b) =>
			{
				if (a.sortOrder > b.sortOrder)
				{
					return -1;
				}

				if (a.sortOrder < b.sortOrder)
				{
					return 1;
				}

				return a.name.localeCompare(b.name);
			});
	}

	override sortGroupModels(groupName: string, games: SeriesGameGroupManagerGame[])
	{
		if (groupName == "Favorites" || groupName == "No Series")
		{
			return games;
		}

		return games
			.map((game) =>
			{
				const seriesGame = game.seriesGames.find((seriesGame) => seriesGame.series.name == groupName) ?? null;

				const seriesGameNumber = seriesGame?.number ?? 0;

				return {
					game,
					seriesGameNumber,
				};
			})
			.sort((a, b) =>
			{
				if (a.seriesGameNumber > b.seriesGameNumber)
				{
					return 1;
				}

				if (a.seriesGameNumber < b.seriesGameNumber)
				{
					return -1;
				}

				return a.game.sortName.localeCompare(b.game.sortName);
			})
			.map((item) => item.game);
	}
}

export class SteamDeckCompatibilityGameGroupManager extends GameGroupManager
{
	override getItemInfo(game: SeriesGameGroupManagerGame, group: GroupManagerGroup<SeriesGameGroupManagerGame>)
	{
		if (group.name != "Favorites")
		{
			return null;
		}

		if (game.steamAppId == null)
		{
			return "Non-Steam Game";
		}

		return game.steamDeckCompatibility != null 
			? GameModelLib.getSteamDeckCompatibilityName(game.steamDeckCompatibility)
			: null;
	}

	override sortModels(games: SeriesGameGroupManagerGame[])
	{
		return games.toSorted((a, b) => a.sortName.localeCompare(b.sortName));
	}

	override groupModels(games: SeriesGameGroupManagerGame[])
	{
		this.addGroup("Favorites", 1);
		
		this.addGroup(GameModelLib.getSteamDeckCompatibilityName("VERIFIED"));
		this.addGroup(GameModelLib.getSteamDeckCompatibilityName("PLAYABLE"));
		this.addGroup(GameModelLib.getSteamDeckCompatibilityName("UNSUPPORTED"));
		this.addGroup(GameModelLib.getSteamDeckCompatibilityName("UNKNOWN"));

		this.addGroup("Non-Steam Games");

		this.addGroup("Unknown");

		for (const game of games)
		{
			if (this.settings.showFavoritesGroup && game.isFavorite)
			{
				this.addModelToGroup("Favorites", game);
			}

			if (game.steamAppId == null)
			{
				this.addModelToGroup("Non-Steam Games", game);

				continue;
			}

			if (game.steamDeckCompatibility == null)
			{
				this.addModelToGroup("Unknown", game);

				continue;
			}

			this.addModelToGroup(GameModelLib.getSteamDeckCompatibilityName(game.steamDeckCompatibility), game);
		}

		return Array.from(this.groupsByName.values());
	}
}