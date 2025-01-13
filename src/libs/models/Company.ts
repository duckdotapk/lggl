//
// Imports
//

import { Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import { ListLayoutOptions } from "../../components/layout/ListLayout.js";

import * as SettingSchemaLib from "../schemas/Setting.js";

//
// Create/Find/Update/Delete Functions
//

export type FindGroupsMode = "name";

export type FindGroupsOptions =
{
	mode: SettingSchemaLib.CompanyGroupMode;
	selectedCompany: Prisma.CompanyGetPayload<null> | null;
};

export async function findGroups(transactionClient: Prisma.TransactionClient, options: FindGroupsOptions)
{
	const companies = await transactionClient.company.findMany(
		{
			orderBy:
			[
				{ name: "asc" },
			],
		});

	const groupsMap = new Map<string, ListLayoutOptions["groups"][0]>();

	switch (options.mode)
	{
		case "name":
		{
			for (const company of companies)
			{
				const charCode = company.name.toUpperCase().charCodeAt(0);
		
				let groupName: string;
		
				if (charCode >= 48 && charCode <= 57)
				{
					groupName = "#";
				}
				else if (charCode >= 65 && charCode <= 90)
				{
					groupName = company.name[0]!.toUpperCase();
				}
				else
				{
					groupName = "?";
				}
		
				const companyGroup = groupsMap.get(groupName) ?? { name: groupName, items: [] };
				
				companyGroup.items.push(
					{
						selected: company.id == options.selectedCompany?.id,
						href: "/companies/view/" + company.id,
						iconName: "fa-solid fa-building",
						name: company.name,
						info: "Last updated " + DateTime.fromJSDate(company.lastUpdatedDate).toLocaleString(DateTime.DATE_MED),
					});
		
				groupsMap.set(groupName, companyGroup);
			}

			break;
		}
	}

	const groups = Array.from(groupsMap.values());

	return groups;
}