//
// Imports
//

import * as Fritter from "@donutteam/fritter";

import { ServerFritterContext } from "../../instances/server.js";

import { view } from "../../views/company/create.js";

//
// Route
//

type RouteFritterContext = ServerFritterContext;

export const route: Fritter.RouterMiddleware.Route<RouteFritterContext> =
{
	method: "GET",
	path: "/companies/create",
	handler: async (context) =>
	{
		context.renderComponent(view());
	},
};