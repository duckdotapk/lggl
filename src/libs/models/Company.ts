//
// Imports
//

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { GroupManager } from "../../classes/GroupManager.js";

import * as SettingModelLib from "../models/Setting.js";

import * as GameCompanySchemaLib from "../schemas/GameCompany.js";

//
// Create/Find/Update/Delete Functions
//

export type FindGroupsOptions =
{
	settings: SettingModelLib.Settings;
	selectedCompany: Prisma.CompanyGetPayload<null> | null;
};

export async function findGroups(transactionClient: Prisma.TransactionClient, options: FindGroupsOptions)
{
	const companies = await transactionClient.company.findMany(
		{
			include:
			{
				gameCompanies: true,
			},
		});

	const groupManager = new GroupManager<typeof companies[0]>(
		{
			mapGroupModel: (company) =>
			{
				return {
					selected: company.id == options.selectedCompany?.id,
					href: "/companies/view/" + company.id,
					iconName: "fa-solid fa-building",
					name: company.name,
					info: "Last updated " + DateTime.fromJSDate(company.lastUpdatedDate).toLocaleString(DateTime.DATE_MED),
				};
			},
		});

	switch (options.settings.companyGroupMode)
	{
		case "name":
		{
			const sortedCompanies = companies.toSorted((a, b) => a.name.localeCompare(b.name));

			for (const company of sortedCompanies)
			{
				const groupName = GroupManager.getNameGroupName(company.name);

				groupManager.addItemToGroup(groupName, company);
			}

			break;
		}

		case "numberOfGamesDeveloped":
		{
			const sortedCompanyWrappers = companies
				.map((company) => 
				{
					return {
						company, 
						numberOfGamesDeveloped: company.gameCompanies.filter((gameCompany) => gameCompany.type == "DEVELOPER" satisfies GameCompanySchemaLib.Type).length,
					};
				})
				.toSorted((a, b) =>
				{
					if (a.numberOfGamesDeveloped != b.numberOfGamesDeveloped)
					{
						return b.numberOfGamesDeveloped - a.numberOfGamesDeveloped;
					}

					return a.company.name.localeCompare(b.company.name);
				});

			for (const companyWrapper of sortedCompanyWrappers)
			{
				const groupName = companyWrapper.numberOfGamesDeveloped + " games developed";

				groupManager.addItemToGroup(groupName, companyWrapper.company);
			}

			break;
		}

		case "numberOfGamesPublished":
		{
			const sortedCompanyWrappers = companies
				.map((company) => 
				{
					return {
						company, 
						numberOfGamesPublished: company.gameCompanies.filter((gameCompany) => gameCompany.type == "PUBLISHER" satisfies GameCompanySchemaLib.Type).length,
					};
				})
				.toSorted((a, b) =>
				{
					if (a.numberOfGamesPublished != b.numberOfGamesPublished)
					{
						return b.numberOfGamesPublished - a.numberOfGamesPublished;
					}

					return a.company.name.localeCompare(b.company.name);
				});

			for (const companyWrapper of sortedCompanyWrappers)
			{
				const groupName = companyWrapper.numberOfGamesPublished + " games published";

				groupManager.addItemToGroup(groupName, companyWrapper.company);
			}

			break;
		}
	}

	return groupManager;
}