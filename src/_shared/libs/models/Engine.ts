//
// Imports
//

import { Prisma } from "@prisma/client";

//
// Create/Update/Find/Delete Functions
//

export async function findOrCreateByName(transactionClient: Prisma.TransactionClient, name: string)
{
	let engine = await transactionClient.engine.findFirst(
		{
			where:
			{
				name,
			},
		});

	if (engine != null)
	{
		return engine;
	}

	return await transactionClient.engine.create(
		{
			data:
			{
				name,
			},
		});
}