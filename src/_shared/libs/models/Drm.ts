//
// Imports
//

import { Prisma } from "@prisma/client";

//
// Create/Update/Find/Delete Functions
//

export async function findOrCreateByName(transactionClient: Prisma.TransactionClient, name: string)
{
	let drm = await transactionClient.drm.findFirst(
		{
			where:
			{
				name,
			},
		});

	if (drm != null)
	{
		return drm;
	}

	return await transactionClient.drm.create(
		{
			data:
			{
				name,
			},
		});
}