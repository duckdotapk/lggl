//
// Imports
//

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { config } from "dotenv";

//
// Environment Variables
//

function loadEnvFile(envFilePath: string)
{
	console.log("Loading environment variables from " + envFilePath + "...");

	config(
		{
			path: envFilePath,
			override: true,
		});
}

if (fs.existsSync(path.join(process.cwd(), ".env")))
{
	loadEnvFile(path.join(process.cwd(), ".env"));
}
else if (fs.existsSync(path.join(os.homedir(), "lggl.env")))
{
	loadEnvFile(path.join(os.homedir(), "lggl.env"));
}
else
{
	console.error("No environment file found.");

	process.exit(1);
}