//
// Imports
//

import { Prisma } from "@prisma/client";

import { NameCompanyGroupManager, NumberOfGamesDevelopedCompanyGroupManager, NumberOfGamesPublishedCompanyGroupManager } from "../../classes/CompanyGroupManager.js";

import * as SettingModelLib from "../models/Setting.js";

//
// Create/Find/Update/Delete Functions
//

export async function createGroupManager(transactionClient: Prisma.TransactionClient, settings: SettingModelLib.Settings, selectedCompany: Prisma.CompanyGetPayload<null> | null)
{
	const companies = await transactionClient.company.findMany(
		{
			include:
			{
				gameCompanies: true,
			},
		});

	switch (settings.companyGroupMode)
	{
		case "name":
			return new NameCompanyGroupManager(settings, companies, selectedCompany);

		case "numberOfGamesDeveloped":
			return new NumberOfGamesDevelopedCompanyGroupManager(settings, companies, selectedCompany);

		case "numberOfGamesPublished":
			return new NumberOfGamesPublishedCompanyGroupManager(settings, companies, selectedCompany);
	}
}