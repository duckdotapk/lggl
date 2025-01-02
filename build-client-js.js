// @ts-check

//
// Imports
//

import chalk from "chalk";
import * as esbuild from "esbuild";
import { DateTime } from "luxon";

//
// ESBuild Script
//



/** 
 * Packages which are expected to be in the client bundle.
 * 
 * @type {Record<string, boolean>} 
 */
const whitelistedPackages =
{
	// Direct Dependencies
	"@donutteam/browser-utilities": true,
	"@donutteam/fritter-api-utilities": true,
	"zod": true,
};

/** @type {esbuild.Plugin} */
let logOnEndPlugin =
{
	name: "logOnEnd",
	setup: (build) =>
	{
		build.onEnd((result) =>
		{
			if (result.metafile == null)
			{
				throw new Error("No metafile found in result.");
			}

			/** @type {Map<string, number>} */
			const bundledPackages = new Map();

			for (const [ fileName, input ] of Object.entries(result.metafile.inputs))
			{
				const isPackageFile = fileName.startsWith("node_modules/");

				if (!isPackageFile)
				{
					continue;
				}

				const fileNameComponents = fileName.split(/[\\/]/);

				let packageName = fileNameComponents[1];

				if (packageName.startsWith("@"))
				{
					packageName += "/" + fileNameComponents[2];
				}

				const bytes = bundledPackages.get(packageName) ?? 0;

				bundledPackages.set(packageName, bytes + input.bytes);
			}

			const sortedBundledPackages = Array.from(bundledPackages).sort(([ aName ], [ bName ]) => aName.localeCompare(bName));

			const dateString = DateTime.utc().toLocaleString(DateTime.DATETIME_MED);
			
			console.log("Built at " + dateString + " with " + sortedBundledPackages.length + " bundled packages:");

			for (const [ packageName, bytes ] of sortedBundledPackages)
			{
				let logText = packageName;

				logText = whitelistedPackages[packageName] 
					? chalk.green(logText) 
					: chalk.red(logText);

				logText = "- " + logText + " (" + bytes.toLocaleString() + " bytes)";

				console.log(logText);
			}
		});
	},
};

const clientContext = await esbuild.context(
	{
		bundle: true,
		entryPoints:
		[
			"src/client.ts",
		],
		external:
		[
			"node:*",
		],
		format: "esm",
		metafile: true,
		minify: true,
		platform: "browser",
		outfile: "./data/generated/client.js",
		plugins:
		[
			logOnEndPlugin,
		],
		sourcemap: "linked",
		target:
		[
			"esnext",
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