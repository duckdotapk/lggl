//
// Imports
//

import util from "node:util";

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { GroupManager } from "./GroupManager.js";

import { HumanDateTime } from "../components/basic/HumanDateTime.js";
//
// Class
//

export abstract class CompanyGroupManager<T extends Prisma.CompanyGetPayload<null> = Prisma.CompanyGetPayload<null>> extends GroupManager<T>
{
	override getItemHref(company: T)
	{
		return "/companies/view/" + company.id;
	}

	override getItemIconName(_company: T)
	{
		return "fa-solid fa-building";
	}

	override getItemName(company: T)
	{
		return company.name;
	}

	override getItemInfo(company: T)
	{
		return [ 
			"Last updated ",
			HumanDateTime(DateTime.fromJSDate(company.lastUpdatedDate)),
		];
	}
}

export class NameCompanyGroupManager extends CompanyGroupManager
{
	override sortModels(companies: Prisma.CompanyGetPayload<null>[])
	{
		return companies.toSorted((a, b) => a.name.localeCompare(b.name));
	}

	override groupModels(companies: Prisma.CompanyGetPayload<null>[])
	{
		for (const company of companies)
		{
			const groupName = GroupManager.getNameGroupName(company.name);

			this.addModelToGroup(groupName, company);
		}

		return Array.from(this.groupsByName.values());
	}
}

export type NumberOfGamesDevelopedCompanyGroupManagerCompany = Prisma.CompanyGetPayload<
{
	include:
	{
		gameCompanies: true;
	};
}>;

export class NumberOfGamesDevelopedCompanyGroupManager extends CompanyGroupManager<NumberOfGamesDevelopedCompanyGroupManagerCompany>
{
	override sortModels(companies: NumberOfGamesDevelopedCompanyGroupManagerCompany[])
	{
		return companies
			.map((company) =>
			{
				return {
					company,
					numberOfGamesDeveloped: company.gameCompanies.filter(
						(gameCompany) => gameCompany.type == "DEVELOPER"
					).length,
				};
			})
			.toSorted((a, b) =>
			{
				if (a.numberOfGamesDeveloped > b.numberOfGamesDeveloped)
				{
					return -1;
				}

				if (a.numberOfGamesDeveloped < b.numberOfGamesDeveloped)
				{
					return 1;
				}

				return a.company.name.localeCompare(b.company.name);
			})
			.map((item) => item.company);
	}

	override groupModels(companies: NumberOfGamesDevelopedCompanyGroupManagerCompany[])
	{
		for (const company of companies)
		{
			const numberOfGamesDeveloped = company.gameCompanies.filter(
				(gameCompany) => gameCompany.type == "DEVELOPER",
			).length;

			const groupName = util.format(
				"%d game%s developed",
				numberOfGamesDeveloped,
				numberOfGamesDeveloped == 1 ? "" : "s",
			);

			this.addModelToGroup(groupName, company);
		}

		return Array.from(this.groupsByName.values());
	}
}

export type NumberOfGamesPublishedCompanyGroupManagerCompany = Prisma.CompanyGetPayload<
{
	include:
	{
		gameCompanies: true;
	};
}>;

export class NumberOfGamesPublishedCompanyGroupManager extends CompanyGroupManager<NumberOfGamesPublishedCompanyGroupManagerCompany>
{
	override sortModels(companies: NumberOfGamesPublishedCompanyGroupManagerCompany[])
	{
		return companies
			.map((company) =>
			{
				return {
					company,
					numberOfGamesPublished: company.gameCompanies.filter(
						(gameCompany) => gameCompany.type == "PUBLISHER",
					).length,
				};
			})
			.toSorted((a, b) =>
			{
				if (a.numberOfGamesPublished > b.numberOfGamesPublished)
				{
					return -1;
				}

				if (a.numberOfGamesPublished < b.numberOfGamesPublished)
				{
					return 1;
				}

				return a.company.name.localeCompare(b.company.name);
			})
			.map((item) => item.company);
	}

	override groupModels(companies: NumberOfGamesPublishedCompanyGroupManagerCompany[])
	{
		for (const company of companies)
		{
			const numberOfGamesPublished = company.gameCompanies.filter
			((gameCompany) => gameCompany.type == "PUBLISHER").length;

			const groupName = util.format(
				"%d game%s published",
				numberOfGamesPublished,
				numberOfGamesPublished == 1 ? "" : "s",
			);

			this.addModelToGroup(groupName, company);
		}

		return Array.from(this.groupsByName.values());
	}
}