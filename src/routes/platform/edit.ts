//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { prismaClient } from "../../instances/prismaClient.js";
import { ServerFritterContext } from "../../instances/server.js";

import * as PlatformModelLib from "../../libs/models/Platform.js";

import { view } from "../../views/platform/edit.js";

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

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/platforms/edit/:platformId",
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

		const groups = await PlatformModelLib.findGroups(prismaClient,
			{
				mode: "name",
				selectedPlatform: platform,
			});

		context.renderComponent(view(
			{
				groups,
				platform,
			}));
	},
};