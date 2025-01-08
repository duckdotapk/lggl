//
// Imports
//

import path from "node:path";

import * as Fritter from "@donutteam/fritter";

import { Site, SiteOptions } from "../components/Site.js";

import { LGGL_DATA_DIRECTORY } from "../env/LGGL_DATA_DIRECTORY.js";

import * as RenderComponentMiddleware from "../middlewares/RenderComponent.js";

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
				path: path.join(LGGL_DATA_DIRECTORY, "fontawesome"),
			},
			{
				mountPath: "/data/generated",
				path: path.join(LGGL_DATA_DIRECTORY, "generated"),
			},
			{
				mountPath: "/data/images",
				path: path.join(LGGL_DATA_DIRECTORY, "images"),
			},
			{ 
				path: path.join(process.cwd(), "static"),
			},
		],
		enableGzip: true,
	});

const logRequestMiddleware = Fritter.LogRequestMiddleware.create();

const bodyParserMiddleware = Fritter.BodyParserMiddleware.create();

const renderComponentMiddleware = RenderComponentMiddleware.create<SiteOptions, ServerFritterContext>(
	{
		componentFunction: Site,
		getOptionsFunction: (_context, partialOptions) =>
		{
			return {
				...Object.fromEntries(Object.entries(partialOptions).filter(([ _key, value ]) => value !== undefined)),
			};
		},
	});

export const routerMiddleware = Fritter.RouterMiddleware.create();

//
// Server
//

export const server = new Fritter.Fritter();

server.use(staticMiddleware.execute);

server.use(logRequestMiddleware.execute);

server.use(bodyParserMiddleware.execute);

server.use(renderComponentMiddleware.execute);

server.use(routerMiddleware.execute);

export type ServerFritterContext =
	Fritter.FritterContext &
	Fritter.StaticMiddleware.MiddlewareFritterContext &
	Fritter.LogRequestMiddleware.MiddlewareFritterContext &
	Fritter.BodyParserMiddleware.MiddlewareFritterContext &
	RenderComponentMiddleware.MiddlewareFritterContext<SiteOptions> &
	Fritter.RouterMiddleware.MiddlewareFritterContext;