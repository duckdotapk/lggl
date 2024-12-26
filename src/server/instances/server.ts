//
// Imports
//

import * as Fritter from "@donutteam/fritter";

//
// Server Middlewares
//

const bodyParserMiddleware = Fritter.BodyParserMiddleware.create();

export const routerMiddleware = Fritter.RouterMiddleware.create();

//
// Server
//

export const server = new Fritter.Fritter();

server.use(bodyParserMiddleware.execute);

server.use(routerMiddleware.execute);

export type ServerFritterContext =
	Fritter.FritterContext &
	Fritter.BodyParserMiddleware.MiddlewareFritterContext &
	Fritter.RouterMiddleware.MiddlewareFritterContext;