//
// Imports
//

import { Prisma } from "@prisma/client";

//
// Create/Update/Find/Delete Functions
//

export async function findOrCreateByName(transactionClient: Prisma.TransactionClient, name: string)
{
	let platform = await transactionClient.platform.findFirst(
		{
			where:
			{
				name,
			},
		});

	if (platform != null)
	{
		return platform;
	}

	return await transactionClient.platform.create(
		{
			data:
			{
				name,
			},
		});
}