//
// Imports
//

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { GroupManager } from "../../classes/GroupManager.js";

import * as SettingModelLib from "../models/Setting.js";

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
	const companies = await transactionClient.company.findMany();

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
	}

	return groupManager;
}