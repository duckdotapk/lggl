//
// Imports
//

import { Prisma } from "@prisma/client";

//
// Create/Update/Find/Delete Functions
//

export async function findOrCreateByName(transactionClient: Prisma.TransactionClient, name: string)
{
	let genre = await transactionClient.genre.findFirst(
		{
			where:
			{
				name,
			},
		});

	if (genre != null)
	{
		return genre;
	}

	return await transactionClient.genre.create(
		{
			data:
			{
				name,
			},
		});
}