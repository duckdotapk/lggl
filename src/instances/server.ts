//
// Imports
//

import path from "node:path";

import
{
	BodyParserMiddleware,
	CurrentPageNumberMiddleware,
	Fritter,
	FritterContext,
	LogRequestMiddleware,
	RouterMiddleware,
	StaticMiddleware,
} from "@lorenstuff/fritter";

import { Site, SiteOptions } from "../components/Site.js";

import { LGGL_DATA_DIRECTORY } from "../env/LGGL_DATA_DIRECTORY.js";

import * as RenderComponentMiddleware from "../middlewares/RenderComponent.js";
import * as SettingsMiddleware from "../middlewares/Settings.js";

//
// Server Middlewares
//

export const staticMiddleware = StaticMiddleware.create(
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

const logRequestMiddleware = LogRequestMiddleware.create();

const bodyParserMiddleware = BodyParserMiddleware.create();

const currentPageNumberMiddleware = CurrentPageNumberMiddleware.create();

const settingsMiddleware = SettingsMiddleware.create();

const renderComponentMiddleware = RenderComponentMiddleware.create<SiteOptions, ServerFritterContext>(
{
	componentFunction: Site,
	getOptionsFunction: (_context, partialOptions) =>
	{
		return {
			currentPage: null,

			...Object.fromEntries(Object.entries(partialOptions).filter(([ _key, value ]) => value !== undefined)),
		};
	},
});

export const routerMiddleware = RouterMiddleware.create();

//
// Server
//

export const server = new Fritter();

server.use(staticMiddleware.execute);
server.use(logRequestMiddleware.execute);
server.use(bodyParserMiddleware.execute);
server.use(currentPageNumberMiddleware.execute);
server.use(settingsMiddleware.execute);
server.use(renderComponentMiddleware.execute);
server.use(routerMiddleware.execute);

export type ServerFritterContext =
	FritterContext &
	StaticMiddleware.MiddlewareFritterContext &
	LogRequestMiddleware.MiddlewareFritterContext &
	BodyParserMiddleware.MiddlewareFritterContext &
	CurrentPageNumberMiddleware.MiddlewareFritterContext &
	SettingsMiddleware.MiddlewareFritterContext &
	RenderComponentMiddleware.MiddlewareFritterContext<SiteOptions> &
	RouterMiddleware.MiddlewareFritterContext;