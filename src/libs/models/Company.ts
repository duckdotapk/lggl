//
// Imports
//

import { Prisma } from "@prisma/client";

//
// Create/Update/Find/Delete Functions
//

export async function findOrCreateByName(transactionClient: Prisma.TransactionClient, name: string)
{
	let company = await transactionClient.company.findFirst(
		{
			where:
			{
				name,
			},
		});

	if (company != null)
	{
		return company;
	}

	return await transactionClient.company.create(
		{
			data:
			{
				name,
			},
		});
}