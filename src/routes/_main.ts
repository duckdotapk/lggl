//
// Imports
//

import { RouterMiddleware } from "@lorenstuff/fritter";

import { ServerFritterContext } from "../instances/server.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/",
	handler: async (context) => context.fritterResponse.setRedirect("/games"),
};