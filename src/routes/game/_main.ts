//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { ServerFritterContext } from "../../instances/server.js";

import * as LauncherLib from "../../libs/Launcher.js";

import { view } from "../../views/game/_main.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/games",
	handler: async (context) =>
	{
		const gameGroupManager = await LauncherLib.fetchGameGroupManager(context.settings);

		context.renderComponent(view(
			{
				settings: context.settings,
				gameGroupManager: gameGroupManager,
			}));
	},
};