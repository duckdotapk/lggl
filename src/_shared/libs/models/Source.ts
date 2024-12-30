//
// Imports
//

import { Prisma } from "@prisma/client";

//
// Create/Update/Find/Delete Functions
//

export async function findOrCreateByName(transactionClient: Prisma.TransactionClient, name: string)
{
	let source = await transactionClient.source.findFirst(
		{
			where:
			{
				name,
			},
		});

	if (source != null)
	{
		return source;
	}

	return await transactionClient.source.create(
		{
			data:
			{
				name,
			},
		});
}