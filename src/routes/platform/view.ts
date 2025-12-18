//
// Imports
//

import { RouterMiddleware } from "@lorenstuff/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import { createPlatformGroupManager } from "../../libs/models/Platform.js";

import { view } from "../../views/platform/view.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext &
{
	routeParameters:
	{
		platformId: string;
	};
};

export const route: RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/platforms/view/:platformId",
	handler: async (context) =>
	{
		const platformId = parseInt(context.routeParameters.platformId);
		if (isNaN(platformId))
		{
			return;
		}

		const platform = await prismaClient.platform.findUnique(
		{
			where:
			{
				id: platformId,
			},
		});
		if (platform == null)
		{
			return;
		}
		
		const groupManager = await createPlatformGroupManager(
			prismaClient,
			context.settings,
			platform,
		);

		const games = await prismaClient.game.findMany(
		{
			where:
			{
				gamePlatforms:
				{
					some:
					{
						platform_id: platformId,
					},
				},
			},
			orderBy:
			[
				{ sortName: "asc" },
			],
		});

		context.renderComponent(view(
		{
			settings: context.settings,
			groupManager,
			platform,
			games,
		}));
	},
};