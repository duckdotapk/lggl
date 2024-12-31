//
// Imports
//

import path from "node:path";

import * as Fritter from "@donutteam/fritter";

import { configuration } from "../../_shared/libs/Configuration.js";

//
// Server Middlewares
//

export const staticMiddleware = Fritter.StaticMiddleware.create(
	{
		cacheControlHeader: "public, max-age=" + (365 * 24 * 60 * 60),
		directories:
		[
			{ 
				mountPath: "/data/fontawesome",
				path: path.join(configuration.dataDirectory, "fontawesome"),
			},
			{
				mountPath: "/data/generated",
				path: path.join(configuration.dataDirectory, "generated"),
			},
			{
				mountPath: "/data/images",
				path: path.join(configuration.dataDirectory, "images"),
			},
			{ 
				path: path.join(process.cwd(), "static"),
			},
		],
		enableGzip: true,
	});

const logRequestMiddleware = Fritter.LogRequestMiddleware.create();

const bodyParserMiddleware = Fritter.BodyParserMiddleware.create();

export const routerMiddleware = Fritter.RouterMiddleware.create();

//
// Server
//

export const server = new Fritter.Fritter();

server.use(staticMiddleware.execute);

server.use(logRequestMiddleware.execute);

server.use(bodyParserMiddleware.execute);

server.use(routerMiddleware.execute);

export type ServerFritterContext =
	Fritter.FritterContext &
	Fritter.StaticMiddleware.MiddlewareFritterContext &
	Fritter.LogRequestMiddleware.MiddlewareFritterContext &
	Fritter.BodyParserMiddleware.MiddlewareFritterContext &
	Fritter.RouterMiddleware.MiddlewareFritterContext;