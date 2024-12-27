// @ts-check

//
// Imports
//

import * as esbuild from "esbuild";

//
// ESBuild Script
//

const clientContext = await esbuild.context(
	{
		bundle: true,
		entryPoints:
		[
			"src/server/client.ts",
		],
		external:
		[
			"node:*",
		],
		format: "esm",
		metafile: true,
		minify: true,
		platform: "browser",
		outfile: "./static/data/client.js",
		sourcemap: "linked",
		target:
		[
			"es6",
		],
	});

if (process.argv.includes("--watch"))
{
	await clientContext.watch();
}
else
{
	await clientContext.rebuild();

	await clientContext.dispose();
}