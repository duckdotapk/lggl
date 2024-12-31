//
// Imports
//

import fs from "node:fs";
import path from "node:path";

import yaml from "yaml";
import { z } from "zod";

//
// Schemas
//

export const ConfigurationSchema = z.object(
	{
		port: z.number().default(8008),
		databaseUrl: z.string().url(),
		dataDirectory: z.string().default(path.join(process.cwd(), "data")),
		steamApiKey: z.string(),
		steamUserId: z.string(),
		platformId: z.number(),
	});

//
// Types
//

export type Configuration = z.infer<typeof ConfigurationSchema>;

//
// Constants
//

export const rawConfiguration = await fs.promises.readFile("./configuration.yaml", "utf8");

export const configuration: Configuration = ConfigurationSchema.parse(yaml.parse(rawConfiguration));