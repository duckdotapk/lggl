//
// Imports
//

import { Prisma } from "@prisma/client";

//
// Create/Update/Find/Delete Functions
//

export async function findOrCreateByName(transactionClient: Prisma.TransactionClient, name: string)
{
	let antiCheat = await transactionClient.antiCheat.findFirst(
		{
			where:
			{
				name,
			},
		});

	if (antiCheat != null)
	{
		return antiCheat;
	}

	return await transactionClient.antiCheat.create(
		{
			data:
			{
				name,
			},
		});
}