//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { ServerFritterContext } from "../instances/server.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/",
	handler: async (context) => context.fritterResponse.setRedirect("/games"),
};