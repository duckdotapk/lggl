//
// Imports
//

import path from "node:path";

import * as Fritter from "@donutteam/fritter";

//
// Server Middlewares
//

export const staticMiddleware = Fritter.StaticMiddleware.create(
	{
		cacheControlHeader: "public, max-age=" + (365 * 24 * 60 * 60),
		directories:
		[
			{ path: path.join(import.meta.dirname, "..", "..", "..", "static") },
		],
		enableGzip: true,
	});

const bodyParserMiddleware = Fritter.BodyParserMiddleware.create();

export const routerMiddleware = Fritter.RouterMiddleware.create();

//
// Server
//

export const server = new Fritter.Fritter();

server.use(staticMiddleware.execute);

server.use(bodyParserMiddleware.execute);

server.use(routerMiddleware.execute);

export type ServerFritterContext =
	Fritter.FritterContext &
	Fritter.StaticMiddleware.MiddlewareFritterContext &
	Fritter.BodyParserMiddleware.MiddlewareFritterContext &
	Fritter.RouterMiddleware.MiddlewareFritterContext;