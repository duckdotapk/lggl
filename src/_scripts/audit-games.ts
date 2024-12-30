//
// Imports
//

import { prismaClient } from "../_shared/instances/prismaClient.js";

//
// Functions
//

async function main()
{
	const games = await prismaClient.game.findMany(
		{
			include:
			{
				gamePlayActions: true,
			},
			orderBy:
			{
				id: "asc",
			},
		});

	for (const game of games)
	{
		const problems: string[] = [];

		if (game.releaseDate == null)
		{
			problems.push("releaseDate is null");
		}

		if (game.bannerImagePath == null)
		{
			problems.push("bannerImagePath is null");
		}

		if (game.coverImagePath == null)
		{
			problems.push("coverImagePath is null");
		}

		if (game.iconImagePath == null)
		{
			problems.push("iconImagePath is null");
		}

		if (game.gamePlayActions.length == 0)
		{
			problems.push("no gamePlayActions");
		}

		if (problems.length == 0)
		{
			continue;
		}

		console.group("Game #" + game.id + " - " + game.name);

		for (const problem of problems)
		{
			console.log(problem);
		}

		console.groupEnd();
	}
}

//
// Script
//

await main();