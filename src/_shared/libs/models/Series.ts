//
// Imports
//

import { Prisma } from "@prisma/client";

//
// Create/Update/Find/Delete Functions
//

export async function findOrCreateByName(transactionClient: Prisma.TransactionClient, name: string)
{
	let series = await transactionClient.series.findFirst(
		{
			where:
			{
				name,
			},
		});

	if (series != null)
	{
		return series;
	}

	return await transactionClient.series.create(
		{
			data:
			{
				name,
			},
		});
}