//
// Imports
//

import { Child, DE } from "@donutteam/document-builder";

import { Sidebar, SidebarPage } from "./Sidebar.js";

import { staticMiddleware } from "../instances/server.js";

//
// Component
//

export type SiteOptions =
{
	currentPage: SidebarPage;
	pageTitle?: string;
	content?: Child;
};

export function Site(options: SiteOptions)
{
	const pageTitle = options.pageTitle != null
		? (options.pageTitle + " | LGGL")
		: "LGGL";

	const content = options.content ?? null;

	return new DE("html",
		{
			lang: "en",
		},
		[
			new DE("head", null,
				[
					new DE("meta", { charset: "utf-8" }),
					
					new DE("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),

					new DE("title", null, pageTitle),

					new DE("link",
						{
							rel: "icon",
							href: "/favicon.ico",
							type: "image/x-icon",
						}),

					new DE("link",
						{
							rel: "stylesheet",
							href: staticMiddleware.getCacheBustedPath("/data/fontawesome/css/all.min.css"),
						}),

					new DE("link",
						{
							rel: "stylesheet",
							href: staticMiddleware.getCacheBustedPath("/data/generated/client.css"),
						}),

					new DE("script",
						{
							type: "module",
							src: staticMiddleware.getCacheBustedPath("/data/generated/client.js"),
						}),
				]),

			new DE("body", null,
				[
					new DE("div", "component-site",
						[
							new DE("div", "sidebar", Sidebar(options.currentPage)),

							new DE("div", "content", content),
						]),
				]),
		]);
}